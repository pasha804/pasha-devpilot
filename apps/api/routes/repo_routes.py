"""
Pasha DevPilot — Repository Management & Search Routes
"""

import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..core.security import decode_access_token
from ..core.audit import record_audit_log
from ..models.repository import Repository, RepositoryFile
from ..models.user import Workspace, User
from ..models.task import Task, TaskStep
from ..schemas.repository import (
    RepositoryCreate,
    BatchConnectRequest,
    RepositoryResponse,
    FileNode,
    CodeSearchQuery,
    CodeSearchResponse,
)
from ..services.github_service import GitHubService
from ..services.indexer_service import RepositoryIndexer
from ..services.search_service import CodeSearchService
from ..services.analyzer_service import RepositoryAnalyzer, RepositoryAnalysisReport, RepositoryIssue
from .agent_routes import run_investigation_worker
from apps.worker.queue import job_queue

router = APIRouter(prefix="/repositories", tags=["Repositories"])


async def ensure_repository_on_disk(repo: Repository, db: AsyncSession, token: Optional[str] = None) -> Path:
    """
    Ensures repository source files are present on disk.
    In ephemeral production containers (e.g. Railway Docker), clones repository
    on demand if disk storage was reset during a container restart or deployment.
    """
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    local_p_str = repo.local_path or f"repos/{repo.owner}_{repo.name}"
    p = Path(local_p_str)
    if not p.is_absolute():
        p = (project_root / local_p_str).resolve()

    # If directory doesn't exist or has no non-hidden files
    has_files = p.exists() and any(f for f in p.iterdir() if f.name != ".git")
    if not has_files:
        clone_url = repo.clone_url or f"https://github.com/{repo.full_name}.git"
        gh = GitHubService(token=token)
        await gh.clone_repository(clone_url, str(p))
        try:
            rel_posix = p.relative_to(project_root).as_posix()
            if repo.local_path != rel_posix:
                repo.local_path = rel_posix
                await db.commit()
        except Exception:
            pass
    return p


@router.get("", response_model=List[RepositoryResponse])
async def list_repositories(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """List repositories for the authenticated user; hide private repositories when logged out."""
    current_username = None
    if authorization and authorization.startswith("Bearer "):
        payload = decode_access_token(authorization.split(" ")[1])
        if payload and "sub" in payload:
            current_username = payload.get("username")
            if not current_username:
                q_u = await db.execute(select(User).where(User.id == payload["sub"]))
                u = q_u.scalars().first()
                if u:
                    current_username = u.username

    stmt = select(Repository).order_by(Repository.created_at.desc())
    if not current_username:
        # Logged out / unauthenticated: only show public / demo repositories, never private repos!
        stmt = stmt.where(Repository.is_private == False)
    else:
        # Logged in: show user's repos or public repos
        stmt = stmt.where(
            (Repository.owner == current_username) | (Repository.is_private == False)
        )

    q = await db.execute(stmt)
    repos = q.scalars().all()

    results = []
    for r in repos:
        # Count files
        q_count = await db.execute(
            select(RepositoryFile).where(RepositoryFile.repository_id == r.id)
        )
        file_count = len(q_count.scalars().all())

        results.append(
            RepositoryResponse(
                id=r.id,
                name=r.name,
                owner=r.owner,
                full_name=r.full_name,
                default_branch=r.default_branch,
                primary_language=r.primary_language,
                detected_frameworks=json.loads(r.detected_frameworks or "[]"),
                detected_test_runners=json.loads(r.detected_test_runners or "[]"),
                is_private=r.is_private,
                local_path=r.local_path,
                indexed_at=r.indexed_at,
                created_at=r.created_at,
                file_count=file_count,
            )
        )
    return results


@router.get("/github-available")
async def list_github_available_repos(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List available GitHub repositories for the authenticated user. Never leaks data when logged out."""
    user_token = token
    resolved_username = username
    if authorization and authorization.startswith("Bearer "):
        payload = decode_access_token(authorization.split(" ")[1])
        if payload and "sub" in payload:
            q = await db.execute(select(User).where(User.id == payload["sub"]))
            u = q.scalars().first()
            if u:
                if u.github_access_token and "mock" not in u.github_access_token:
                    user_token = u.github_access_token
                if not resolved_username and u.username:
                    resolved_username = u.username

    # Resolve user token by explicitly requested username
    if not user_token and resolved_username:
        q_by_user = await db.execute(select(User).where(User.username == resolved_username))
        u_named = q_by_user.scalars().first()
        if u_named and u_named.github_access_token and "mock" not in u_named.github_access_token:
            user_token = u_named.github_access_token

    # If unauthenticated and no username is specified, return empty list (do NOT leak other users' repos!)
    if not user_token and not resolved_username:
        return []

    gh = GitHubService(token=user_token)
    repos = await gh.list_repositories(username=resolved_username)
    return repos


@router.post("", response_model=RepositoryResponse)
async def create_or_connect_repository(
    payload: RepositoryCreate,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Connect a new repository to DevPilot, cloning remote repositories if needed."""
    # Find default workspace
    q_ws = await db.execute(select(Workspace).limit(1))
    ws = q_ws.scalars().first()
    workspace_id = ws.id if ws else "default"

    # Get user token for private repo clone
    user_token = None
    if authorization and authorization.startswith("Bearer "):
        payload_jwt = decode_access_token(authorization.split(" ")[1])
        if payload_jwt and "sub" in payload_jwt:
            q_u = await db.execute(select(User).where(User.id == payload_jwt["sub"]))
            u = q_u.scalars().first()
            if u:
                user_token = u.github_access_token

    full_name = f"{payload.owner}/{payload.name}"
    local_path = payload.local_path
    if not local_path:
        if "demo" in payload.name.lower():
            local_path = "demo-repo"
        else:
            local_path = f"repos/{payload.owner}_{payload.name}"

    # Clone repository if clone_url provided and not already present
    if payload.clone_url:
        gh = GitHubService(token=user_token)
        clone_res = await gh.clone_repository(payload.clone_url, local_path)
        if clone_res.get("status") == "error":
            err_msg = clone_res.get("output", "")
            if any(term in err_msg.lower() for term in ["authentication failed", "could not read username", "repository not found", "fatal"]):
                raise HTTPException(
                    status_code=401,
                    detail=f"GitHub clone failed: {err_msg.strip() or 'Access denied'}. Please ensure you are authorized via GitHub OAuth or PAT with 'repo' scope."
                )

    # Check if existing
    q_existing = await db.execute(select(Repository).where(Repository.full_name == full_name))
    repo = q_existing.scalars().first()

    if not repo:
        repo = Repository(
            workspace_id=workspace_id,
            name=payload.name,
            owner=payload.owner,
            full_name=full_name,
            default_branch=payload.default_branch,
            is_private=payload.is_private,
            local_path=local_path,
            clone_url=payload.clone_url,
        )
        db.add(repo)
        await db.commit()
        await db.refresh(repo)

    # Automatically trigger initial indexing
    indexer = RepositoryIndexer(repo.local_path or ".")
    await indexer.index_repository(db, repo.id)
    await db.refresh(repo)

    await record_audit_log(db, action="CONNECT_REPOSITORY", resource_type="REPOSITORY", resource_id=repo.id)

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        owner=repo.owner,
        full_name=repo.full_name,
        default_branch=repo.default_branch,
        primary_language=repo.primary_language,
        detected_frameworks=json.loads(repo.detected_frameworks or "[]"),
        detected_test_runners=json.loads(repo.detected_test_runners or "[]"),
        is_private=repo.is_private,
        local_path=repo.local_path,
        indexed_at=repo.indexed_at,
        created_at=repo.created_at,
    )


@router.post("/batch-connect", response_model=List[RepositoryResponse])
async def batch_connect_repositories(
    payload: BatchConnectRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Link multiple or all GitHub repositories for the authenticated user in 1 click."""
    q_ws = await db.execute(select(Workspace).limit(1))
    ws = q_ws.scalars().first()
    workspace_id = ws.id if ws else "default"

    user_token = None
    if authorization and authorization.startswith("Bearer "):
        payload_jwt = decode_access_token(authorization.split(" ")[1])
        if payload_jwt and "sub" in payload_jwt:
            q_u = await db.execute(select(User).where(User.id == payload_jwt["sub"]))
            u = q_u.scalars().first()
            if u:
                user_token = u.github_access_token

    items_to_connect: List[RepositoryCreate] = []
    if payload.connect_all:
        gh = GitHubService(token=user_token)
        available = await gh.list_repositories()
        for r in available:
            items_to_connect.append(
                RepositoryCreate(
                    name=r["name"],
                    owner=r["owner"]["login"] if isinstance(r.get("owner"), dict) else str(r.get("owner", "user")),
                    clone_url=r.get("clone_url"),
                    default_branch=r.get("default_branch", "main"),
                    is_private=r.get("private", False),
                )
            )
    elif payload.repositories:
        items_to_connect = payload.repositories

    connected_responses: List[RepositoryResponse] = []
    for item in items_to_connect:
        full_name = f"{item.owner}/{item.name}"
        local_path = item.local_path or f"repos/{item.owner}_{item.name}"

        if item.clone_url:
            gh = GitHubService(token=user_token)
            await gh.clone_repository(item.clone_url, local_path)

        q_existing = await db.execute(select(Repository).where(Repository.full_name == full_name))
        repo = q_existing.scalars().first()

        if not repo:
            repo = Repository(
                workspace_id=workspace_id,
                name=item.name,
                owner=item.owner,
                full_name=full_name,
                default_branch=item.default_branch,
                is_private=item.is_private,
                local_path=local_path,
                clone_url=item.clone_url,
            )
            db.add(repo)
            await db.commit()
            await db.refresh(repo)

        indexer = RepositoryIndexer(repo.local_path or ".")
        await indexer.index_repository(db, repo.id)
        await db.refresh(repo)

        connected_responses.append(
            RepositoryResponse(
                id=repo.id,
                name=repo.name,
                owner=repo.owner,
                full_name=repo.full_name,
                default_branch=repo.default_branch,
                primary_language=repo.primary_language,
                detected_frameworks=json.loads(repo.detected_frameworks or "[]"),
                detected_test_runners=json.loads(repo.detected_test_runners or "[]"),
                is_private=repo.is_private,
                local_path=repo.local_path,
                indexed_at=repo.indexed_at,
                created_at=repo.created_at,
            )
        )

    return connected_responses


@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository_details(repo_id: str, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    q_count = await db.execute(select(RepositoryFile).where(RepositoryFile.repository_id == repo.id))
    file_count = len(q_count.scalars().all())

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        owner=repo.owner,
        full_name=repo.full_name,
        default_branch=repo.default_branch,
        primary_language=repo.primary_language,
        detected_frameworks=json.loads(repo.detected_frameworks or "[]"),
        detected_test_runners=json.loads(repo.detected_test_runners or "[]"),
        is_private=repo.is_private,
        local_path=repo.local_path,
        indexed_at=repo.indexed_at,
        created_at=repo.created_at,
        file_count=file_count,
    )


@router.post("/{repo_id}/index")
async def index_repository_endpoint(repo_id: str, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    indexer = RepositoryIndexer(repo.local_path or ".")
    result = await indexer.index_repository(db, repo.id)
    await record_audit_log(db, action="INDEX_REPOSITORY", resource_type="REPOSITORY", resource_id=repo.id, metadata=result)
    return result


@router.get("/{repo_id}/tree")
async def get_repository_file_tree(repo_id: str, db: AsyncSession = Depends(get_db)):
    """Returns the indexed repository files formatted as a nested hierarchy."""
    q_repo = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q_repo.scalars().first()
    if repo:
        await ensure_repository_on_disk(repo, db)

    q = await db.execute(
        select(RepositoryFile)
        .where(RepositoryFile.repository_id == repo_id)
        .order_by(RepositoryFile.path.asc())
    )
    files = q.scalars().all()

    if not files and repo:
        indexer = RepositoryIndexer(repo.local_path or ".")
        await indexer.index_repository(db, repo.id)
        q = await db.execute(
            select(RepositoryFile)
            .where(RepositoryFile.repository_id == repo_id)
            .order_by(RepositoryFile.path.asc())
        )
        files = q.scalars().all()

    # Build hierarchical tree
    root_node = {"name": "root", "path": "", "is_dir": True, "children": {}}

    for f in files:
        parts = f.path.split("/")
        curr = root_node
        for idx, part in enumerate(parts):
            is_last = (idx == len(parts) - 1)
            if is_last:
                curr["children"][part] = {
                    "name": part,
                    "path": f.path,
                    "is_dir": False,
                    "size_bytes": f.size_bytes,
                    "language": f.language,
                    "is_sensitive": f.is_sensitive,
                }
            else:
                if part not in curr["children"]:
                    sub_path = "/".join(parts[: idx + 1])
                    curr["children"][part] = {
                        "name": part,
                        "path": sub_path,
                        "is_dir": True,
                        "children": {},
                    }
                curr = curr["children"][part]

    def flatten_tree(node: dict) -> dict:
        if not node.get("is_dir"):
            return node
        children_list = [flatten_tree(child) for child in node["children"].values()]
        # Sort folders first, then files alphabetically
        children_list.sort(key=lambda x: (not x.get("is_dir", False), x.get("name", "")))
        return {
            "name": node.get("name", ""),
            "path": node.get("path", ""),
            "is_dir": True,
            "children": children_list,
        }

    return flatten_tree(root_node).get("children", [])


@router.get("/{repo_id}/file")
async def read_repository_file(
    repo_id: str,
    path: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    await ensure_repository_on_disk(repo, db)
    repo_root = Path(repo.local_path or ".").resolve()
    target_file = (repo_root / path).resolve()

    if not target_file.is_relative_to(repo_root) or not target_file.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.name.startswith(".env") or target_file.suffix in (".pem", ".key", ".cert"):
        raise HTTPException(status_code=403, detail="Sensitive file excluded from viewing")

    content = target_file.read_text(encoding="utf-8", errors="replace")
    return {"path": path, "content": content, "lines": len(content.splitlines())}


@router.post("/{repo_id}/search", response_model=CodeSearchResponse)
async def search_repository_code(
    repo_id: str,
    payload: CodeSearchQuery,
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    search_svc = CodeSearchService(repo.local_path or ".")
    st = payload.search_type.lower()

    if st == "symbol":
        matches = await search_svc.symbol_search(db, repo.id, payload.query, limit=payload.limit)
    elif st == "semantic":
        matches = await search_svc.semantic_intent_search(payload.query, limit=payload.limit)
    else:
        matches = await search_svc.exact_search(payload.query, limit=payload.limit, file_ext=payload.file_extension)

    return CodeSearchResponse(
        query=payload.query,
        search_type=st,
        total_matches=len(matches),
        results=matches,
    )


from pydantic import BaseModel


class ResolveIssuePayload(BaseModel):
    issue_id: Optional[str] = None
    id: Optional[str] = None
    title: str
    description: str
    category: str = "LOGIC_BUG"
    severity: str = "HIGH"
    file_path: Optional[str] = None
    file: Optional[str] = None
    line_number: Optional[int] = None
    line: Optional[int] = None
    suggested_fix: Optional[str] = None
    suggested_improvement: Optional[str] = None
    code_snippet: Optional[str] = None
    evidence: Optional[str] = None


class ResolveAllPayload(BaseModel):
    issues: List[ResolveIssuePayload]


@router.post("/{repo_id}/scan", response_model=RepositoryAnalysisReport)
async def scan_repository(repo_id: str, db: AsyncSession = Depends(get_db)):
    """Run real-time multi-stage AI diagnostic scan across the repository."""
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    await ensure_repository_on_disk(repo, db)
    analyzer = RepositoryAnalyzer(repo.local_path or ".")
    report = await analyzer.analyze(repo.id)
    await record_audit_log(db, action="SCAN_REPOSITORY", resource_type="REPOSITORY", resource_id=repo.id, metadata={"total_issues": report.total_issues})
    return report


@router.get("/{repo_id}/issues", response_model=RepositoryAnalysisReport)
async def get_repository_issues(repo_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches diagnostic issues for repository."""
    return await scan_repository(repo_id, db)


@router.post("/{repo_id}/resolve-issue")
async def resolve_repository_issue(
    repo_id: str,
    payload: ResolveIssuePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Automatically launches an autonomous engineering agent to remediate a detected issue."""
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    await ensure_repository_on_disk(repo, db)

    classification = "BUG_FIX"
    if payload.category in ("SECURITY", "Security"):
        classification = "SECURITY"
    elif payload.category in ("TEST_FAILURE", "Testing"):
        classification = "BUG_FIX"

    target_file = payload.file_path or payload.file or "src"
    target_line = payload.line_number or payload.line
    fix_suggestion = payload.suggested_fix or payload.suggested_improvement or ""
    snippet = payload.code_snippet or payload.evidence or ""
    issue_ident = payload.issue_id or payload.id or "ISSUE-001"

    target_line_str = f":{target_line}" if target_line else ""
    fix_suggestion_str = f"\nSuggested Fix: {fix_suggestion}" if fix_suggestion else ""
    snippet_str = f"\n\nOffending Code Snippet:\n```\n{snippet}\n```" if snippet else ""
    offending_code_block = f"- **Offending Code:**\n```\n{snippet}\n```" if snippet else ""

    task_desc = f"{payload.description}\n\nIssue ID: {issue_ident}\nTarget File: {target_file}{target_line_str}{fix_suggestion_str}{snippet_str}"

    initial_plan = f"""### Implementation Strategy (Remediation Plan)

#### 1. Scope & Objective
Remediate detected defect **{payload.title}** ({issue_ident}) in `{target_file}` and verify zero regressions against the repository test suite.

#### 2. Root Cause Analysis
- **Target File:** `{target_file}`{target_line_str}
- **Defect Category:** `{classification}`
- **Observed Behavior:** {payload.description}
{offending_code_block}

#### 3. Targeted Remediation Steps
1. Checkout isolated task branch `devpilot/task-branch`
2. Apply precision patch to `{target_file}`:
   {fix_suggestion or 'Correct inverted comparison operator / calculation logic.'}
3. Execute automated test suite (`pytest`) inside isolated sandbox
4. Verify all assertion gates pass with zero regressions

#### 4. Safety & Verification Gate
- Human-in-the-loop developer approval required before code modification
- Sandboxed execution strictly isolated from production environment
- Truthful unified diff preview and 1-click Pull Request generation
"""

    task = Task(
        repository_id=repo.id,
        title=f"Resolve: {payload.title}",
        description=task_desc,
        classification=classification,
        state="UNDERSTANDING",
        current_mode="ANALYZE",
        plan_markdown=initial_plan,
    )
    db.add(task)
    await db.flush()

    # Steps
    step_defs = [
        (1, "Understand & Classify", "Analyze task intent and repository structure"),
        (2, "Investigate Context", "Search symbols and files for root cause"),
        (3, "Formulate Plan", "Generate implementation strategy and assessment"),
        (4, "Human Approval Gate", "User review and approval of plan"),
        (5, "Implement Code Changes", "Apply targeted patches and create diffs"),
        (6, "Automated Verification", "Execute test runner in sandbox environment"),
        (7, "Review & Ship", "Prepare pull request and summarize results"),
    ]
    for num, name, desc in step_defs:
        s = TaskStep(
            task_id=task.id,
            step_number=num,
            name=name,
            description=desc,
            status="RUNNING" if num == 1 else "PENDING",
        )
        db.add(s)

    await db.commit()
    await record_audit_log(db, action="CREATE_ISSUE_REMEDIATION_TASK", resource_type="TASK", resource_id=task.id)

    # Schedule background worker (ensures in-process execution even if Redis worker isn't running)
    job_id = await job_queue.enqueue("investigate_task", {
        "task_id": task.id,
        "repo_id": repo.id,
        "repo_path": repo.local_path or ".",
        "description": task.description,
    })
    background_tasks.add_task(
        run_investigation_worker,
        task_id=task.id,
        repo_id=repo.id,
        repo_path=repo.local_path or ".",
        description=task.description,
    )

    return {"status": "TASK_CREATED", "task_id": task.id, "title": task.title, "job_id": job_id}


@router.post("/{repo_id}/resolve-all")
async def resolve_all_issues(
    repo_id: str,
    payload: ResolveAllPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Automatically orchestrates remediation tasks for all detected repository issues."""
    q = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = q.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    created_tasks = []
    for issue in payload.issues:
        res = await resolve_repository_issue(repo_id, issue, background_tasks, db)
        created_tasks.append(res)

    return {
        "status": "ALL_TASKS_SCHEDULED",
        "total_queued": len(created_tasks),
        "tasks": created_tasks,
    }
