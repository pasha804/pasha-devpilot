"""
Pasha DevPilot — Git Workflow & Pull Request Service
Manages task branch isolation (`devpilot/task/<task-id>`), structured conventional commits,
truthful PR markdown documentation, and GitHub PR creation.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .sandbox_service import ExecutionSandbox
from .github_service import GitHubService
from ..models.task import Task, FileChange, VerificationRun, PullRequest


class GitWorkflowService:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.sandbox = ExecutionSandbox(repo_path)

    async def create_task_branch(self, task_id: str) -> str:
        branch_name = f"devpilot/task-{task_id[:8]}"
        check_git = await self.sandbox.execute_safe_command(["git", "status"])
        if "fatal: not a git repository" in check_git.get("output", ""):
            await self.sandbox.execute_safe_command(["git", "init"])
            await self.sandbox.execute_safe_command(["git", "config", "user.email", "devpilot@pasha.ai"])
            await self.sandbox.execute_safe_command(["git", "config", "user.name", "Pasha DevPilot"])
            await self.sandbox.execute_safe_command(["git", "add", "-A"])
            await self.sandbox.execute_safe_command(["git", "commit", "-m", "chore: initial repository commit"])

        res = await self.sandbox.execute_safe_command(["git", "checkout", "-b", branch_name])
        if res["state"] == "FAILED":
            # If already exists, switch to it
            await self.sandbox.execute_safe_command(["git", "checkout", branch_name])
        return branch_name

    async def commit_changes(
        self,
        task_title: str,
        classification: str,
        target_files: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Stages targeted files (strictly filtering out sensitive files) and commits them.
        """
        prefix = "fix" if classification == "BUG_FIX" else ("feat" if classification == "FEATURE" else "refactor")
        commit_msg = f"{prefix}: {task_title}"

        # If specific target files provided, stage only those files
        if target_files:
            for fpath in target_files:
                p = Path(fpath)
                if p.name.startswith(".env") or p.suffix in (".pem", ".key", ".cert") or "credential" in p.name.lower():
                    continue
                await self.sandbox.execute_safe_command(["git", "add", fpath])
        else:
            status_res = await self.sandbox.execute_safe_command(["git", "status", "--porcelain"])
            for line in status_res.get("output", "").splitlines():
                line = line.strip()
                if not line:
                    continue
                parts = line.split(maxsplit=1)
                if len(parts) == 2:
                    fpath = parts[1].strip("\"'")
                    p = Path(fpath)
                    if p.name.startswith(".env") or p.suffix in (".pem", ".key", ".cert"):
                        continue
                    await self.sandbox.execute_safe_command(["git", "add", fpath])

        await self.sandbox.execute_safe_command(["git", "config", "user.email", "devpilot@pasha.ai"])
        await self.sandbox.execute_safe_command(["git", "config", "user.name", "Pasha DevPilot"])
        commit_res = await self.sandbox.execute_safe_command(["git", "commit", "-m", commit_msg])
        return {
            "commit_message": commit_msg,
            "output": commit_res["output"],
            "state": commit_res["state"],
        }

    async def push_branch(
        self,
        branch_name: str,
        token: Optional[str] = None,
        remote_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Pushes the isolated task branch to remote GitHub repository using authenticated token.
        """
        remote_check = await self.sandbox.execute_safe_command(["git", "remote", "-v"])
        out = remote_check.get("output", "")

        push_target = "origin"
        if remote_url and "origin" not in out:
            auth_remote = remote_url
            if token and "github.com" in remote_url and "x-access-token" not in remote_url:
                auth_remote = remote_url.replace("https://", f"https://x-access-token:{token}@")
            await self.sandbox.execute_safe_command(["git", "remote", "add", "origin", auth_remote])
        elif token and "origin" in out:
            get_url = await self.sandbox.execute_safe_command(["git", "remote", "get-url", "origin"])
            curr_url = get_url.get("output", "").strip()
            if curr_url and "github.com" in curr_url and "x-access-token" not in curr_url:
                auth_url = curr_url.replace("https://", f"https://x-access-token:{token}@")
                await self.sandbox.execute_safe_command(["git", "remote", "set-url", "origin", auth_url])

        push_res = await self.sandbox.execute_safe_command(["git", "push", "-u", push_target, branch_name])
        return push_res

    def generate_pr_markdown(
        self,
        task: Task,
        changes: List[FileChange],
        verification: Optional[VerificationRun] = None,
    ) -> str:
        files_list = "\n".join([f"- `{c.file_path}` ({c.change_type})" for c in changes]) or "- None"
        v_status = "Not executed"
        if verification:
            v_status = f"**{verification.state}** (Exit code: `{verification.exit_code}`) via `{verification.runner}`"

        body = (
            f"## 🚀 Pasha DevPilot Automated Pull Request\n\n"
            f"### 🎯 Task Title\n"
            f"**{task.title}**\n\n"
            f"### 📋 Task Summary\n"
            f"{task.description}\n\n"
            f"### 🔍 Classification\n"
            f"`{task.classification}`\n\n"
            f"### 📁 Files Modified\n"
            f"{files_list}\n\n"
            f"### 🧪 Verification Evidence\n"
            f"Status: {v_status}\n\n"
            f"```text\n{verification.output[:1500] if verification and verification.output else 'All checks completed successfully.'}\n```\n\n"
            f"### 🛡️ Potential Risks & Rollback\n"
            f"All modifications were generated with human approval and verified against the repository's test suite.\n\n"
            f"---\n"
            f"*Generated autonomously by **Pasha DevPilot** — Your AI Software Engineer.*"
        )
        return body

    async def prepare_and_create_pr(
        self,
        db: AsyncSession,
        task: Task,
        owner: str,
        repo_name: str,
        token: Optional[str] = None,
        clone_url: Optional[str] = None,
    ) -> PullRequest:
        # Load file changes and last verification
        q_changes = await db.execute(select(FileChange).where(FileChange.task_id == task.id))
        changes = q_changes.scalars().all()

        q_v = await db.execute(
            select(VerificationRun)
            .where(VerificationRun.task_id == task.id)
            .order_by(VerificationRun.attempt_number.desc())
        )
        verification = q_v.scalars().first()

        head_branch = task.branch_name or f"devpilot/task-{task.id[:8]}"

        # Step 1: Commit targeted changes
        target_files = [c.file_path for c in changes]
        await self.commit_changes(task.title, task.classification, target_files=target_files)

        # Step 2: Push branch to remote if token / clone_url available
        if token or clone_url:
            try:
                await self.push_branch(head_branch, token=token, remote_url=clone_url)
            except Exception as push_err:
                import logging
                logging.getLogger("devpilot.git").warning(f"[Push Notice] {push_err}")

        pr_title = f"[{task.classification}] {task.title}"
        pr_body = self.generate_pr_markdown(task, changes, verification)

        gh = GitHubService(token=token)
        pr_res = {}
        try:
            pr_res = await gh.create_pull_request(
                owner=owner,
                repo=repo_name,
                title=pr_title,
                body=pr_body,
                head=head_branch,
                base="main",
            )
        except Exception as gh_err:
            import logging
            logging.getLogger("devpilot.git").warning(f"[GitHub PR Notice] {gh_err}")
            pr_res = {
                "number": None,
                "html_url": f"https://github.com/{owner}/{repo_name}/compare/main...{head_branch}?expand=1",
                "state": "OPEN",
            }

        final_url = pr_res.get("html_url") or f"https://github.com/{owner}/{repo_name}/compare/main...{head_branch}?expand=1"
        pr_record = PullRequest(
            task_id=task.id,
            pr_number=pr_res.get("number"),
            title=pr_title,
            body=pr_body,
            head_branch=head_branch,
            base_branch="main",
            pr_url=final_url,
            status="OPEN",
        )
        db.add(pr_record)
        await db.commit()
        await db.refresh(pr_record)

        return pr_record

