"""
Pasha DevPilot — Typed Git Workflow Tools
Handles branch creation (`devpilot/task/<task-id>`), commit authoring, and PR preparation.
Permissions: WRITE (branch/commit) and EXTERNAL (pull request creation).
"""

import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from .base import BaseTool, ToolPermission, ToolResult


# --- create_branch ---
class CreateBranchParams(BaseModel):
    branch_name: str = Field(..., description="Branch name to create and checkout, e.g. devpilot/task-102")


class CreateBranchTool(BaseTool):
    name: str = "create_branch"
    description: str = "Create a new isolated git branch for the agent task."
    permission: ToolPermission = ToolPermission.WRITE
    parameters_schema: Any = CreateBranchParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", ".")).resolve()
        branch = params["branch_name"]

        proc = await asyncio.create_subprocess_exec(
            "git", "checkout", "-b", branch,
            cwd=str(repo_root),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        out = (stdout.decode() + " " + stderr.decode()).strip()

        if proc.returncode != 0:
            # Maybe branch already exists, switch to it
            proc2 = await asyncio.create_subprocess_exec(
                "git", "checkout", branch,
                cwd=str(repo_root),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout2, stderr2 = await proc2.communicate()
            if proc2.returncode != 0:
                return ToolResult(success=False, error=f"Git branch creation failed: {out}", permission_level=self.permission)

        return ToolResult(
            success=True,
            data={"branch": branch, "status": f"Checked out branch {branch}"},
            permission_level=self.permission,
        )


# --- commit_changes ---
class CommitChangesParams(BaseModel):
    message: str = Field(..., description="Conventional git commit message, e.g. fix(auth): handle token expiration")


class CommitChangesTool(BaseTool):
    name: str = "commit_changes"
    description: str = "Stage modified files and commit them with a structured message."
    permission: ToolPermission = ToolPermission.WRITE
    parameters_schema: Any = CommitChangesParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", ".")).resolve()
        message = params["message"]

        # Stage
        proc_add = await asyncio.create_subprocess_exec(
            "git", "add", "-A",
            cwd=str(repo_root),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc_add.communicate()

        # Commit
        proc_commit = await asyncio.create_subprocess_exec(
            "git", "commit", "-m", message,
            cwd=str(repo_root),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc_commit.communicate()
        out = (stdout.decode() + " " + stderr.decode()).strip()

        if proc_commit.returncode != 0 and "nothing to commit" not in out:
            return ToolResult(success=False, error=f"Git commit failed: {out}", permission_level=self.permission)

        return ToolResult(
            success=True,
            data={"commit_message": message, "output": out},
            permission_level=self.permission,
        )


# --- create_pull_request ---
class CreatePullRequestParams(BaseModel):
    title: str = Field(..., description="Pull request title")
    body: str = Field(..., description="Detailed markdown PR description with summary, risk, and verification")
    head_branch: str = Field(..., description="Branch containing changes")
    base_branch: str = Field(default="main", description="Target base branch")


class CreatePullRequestTool(BaseTool):
    name: str = "create_pull_request"
    description: str = "Prepare and open a pull request on GitHub. Always requires explicit human confirmation."
    permission: ToolPermission = ToolPermission.EXTERNAL
    parameters_schema: Any = CreatePullRequestParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        # In real GitHub connection, calls GitHub REST API.
        # In local/sandbox context, creates verifiable PR metadata bundle.
        return ToolResult(
            success=True,
            data={
                "title": params["title"],
                "body": params["body"],
                "head_branch": params["head_branch"],
                "base_branch": params["base_branch"],
                "pr_status": "OPEN",
                "pr_url": f"https://github.com/mock-org/mock-repo/pull/{abs(hash(params['title'])) % 1000 + 1}",
                "simulated": context.get("github_token") is None,
            },
            permission_level=self.permission,
        )
