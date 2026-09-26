"""
Pasha DevPilot — Pull Request Generation Routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..core.security import decode_access_token
from ..core.audit import record_audit_log
from ..models.task import Task, PullRequest
from ..models.repository import Repository
from ..models.user import User
from ..schemas.verification import PullRequestCreate, PullRequestResponse
from ..services.git_workflow_service import GitWorkflowService
from ..services.event_bus import event_bus

router = APIRouter(tags=["Pull Requests"])


@router.post("/tasks/{task_id}/pull-request", response_model=PullRequestResponse)
async def create_pull_request_for_task(
    task_id: str,
    payload: PullRequestCreate,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(Task).where(Task.id == task_id))
    task = q.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    q_repo = await db.execute(select(Repository).where(Repository.id == task.repository_id))
    repo = q_repo.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Resolve active GitHub token for remote push and PR creation
    user_token = None
    if authorization and authorization.startswith("Bearer "):
        payload_jwt = decode_access_token(authorization.split(" ")[1])
        if payload_jwt and "sub" in payload_jwt:
            q_u = await db.execute(select(User).where(User.id == payload_jwt["sub"]))
            u = q_u.scalars().first()
            if u and u.github_access_token and "mock" not in u.github_access_token:
                user_token = u.github_access_token

    if not user_token:
        q_recent = await db.execute(
            select(User).where(User.github_access_token.isnot(None)).order_by(User.created_at.desc())
        )
        recent_u = q_recent.scalars().first()
        if recent_u and recent_u.github_access_token and "mock" not in recent_u.github_access_token:
            user_token = recent_u.github_access_token

    git_svc = GitWorkflowService(repo.local_path or ".")
    pr = await git_svc.prepare_and_create_pr(
        db,
        task=task,
        owner=repo.owner,
        repo_name=repo.name,
        token=user_token,
        clone_url=repo.clone_url,
    )

    task.state = "COMPLETED"
    await db.commit()

    await record_audit_log(db, action="CREATE_PULL_REQUEST", resource_type="PR", resource_id=pr.id)

    await event_bus.publish(
        task.id,
        {
            "task_id": task.id,
            "event_type": "pr_ready",
            "state": "COMPLETED",
            "message": f"Pull Request opened: {pr.title} ({pr.pr_url or 'Local PR'})",
            "payload": {"pr_url": pr.pr_url, "pr_number": pr.pr_number},
        },
    )

    return PullRequestResponse(
        id=pr.id,
        task_id=pr.task_id,
        title=pr.title,
        body=pr.body,
        head_branch=pr.head_branch,
        base_branch=pr.base_branch,
        pr_number=pr.pr_number,
        pr_url=pr.pr_url,
        status=pr.status,
        created_at=pr.created_at,
    )


@router.get("/pull-requests", response_model=List[PullRequestResponse])
async def list_all_pull_requests(db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(PullRequest).order_by(PullRequest.created_at.desc()))
    prs = q.scalars().all()
    return [
        PullRequestResponse(
            id=p.id,
            task_id=p.task_id,
            title=p.title,
            body=p.body,
            head_branch=p.head_branch,
            base_branch=p.base_branch,
            pr_number=p.pr_number,
            pr_url=p.pr_url,
            status=p.status,
            created_at=p.created_at,
        )
        for p in prs
    ]
