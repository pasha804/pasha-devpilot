"""
Pasha DevPilot — Typed Write Tools
Permission: WRITE (edit, create, rename) and DESTRUCTIVE (delete).
Generates unified diffs and records state for rollback.
"""

import difflib
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from .base import BaseTool, ToolPermission, ToolResult


# --- create_file ---
class CreateFileParams(BaseModel):
    file_path: str = Field(..., description="Relative destination path for the new file")
    content: str = Field(..., description="Initial source code content")
    overwrite: bool = Field(default=False, description="Whether to overwrite if file exists")


class CreateFileTool(BaseTool):
    name: str = "create_file"
    description: str = "Create a new file in the repository with specified content."
    permission: ToolPermission = ToolPermission.WRITE
    parameters_schema: Any = CreateFileParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        file_path = (repo_root / params["file_path"]).resolve()

        if not file_path.is_relative_to(repo_root):
            return ToolResult(success=False, error="Security violation: Path outside repository", permission_level=self.permission)

        if file_path.name.startswith(".env") or file_path.suffix in (".pem", ".key", ".cert"):
            return ToolResult(success=False, error="Security violation: Creating secret file is blocked", permission_level=self.permission)

        if file_path.exists() and not params.get("overwrite", False):
            return ToolResult(success=False, error=f"File '{params['file_path']}' already exists", permission_level=self.permission)

        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(params["content"], encoding="utf-8")

        diff = f"--- /dev/null\n+++ b/{params['file_path']}\n@@ -0,0 +1,{len(params['content'].splitlines())} @@\n" + "\n".join(
            f"+{line}" for line in params["content"].splitlines()
        )

        return ToolResult(
            success=True,
            data={
                "file_path": params["file_path"],
                "created": True,
                "lines_added": len(params["content"].splitlines()),
                "diff": diff,
            },
            permission_level=self.permission,
        )


# --- edit_file ---
class EditFileParams(BaseModel):
    file_path: str = Field(..., description="Relative path of file to modify")
    new_content: str = Field(..., description="Target full content of the file")
    explanation: Optional[str] = Field(default="", description="Reason for the changes")


class EditFileTool(BaseTool):
    name: str = "edit_file"
    description: str = "Apply modifications to an existing repository file, generating a unified diff."
    permission: ToolPermission = ToolPermission.WRITE
    parameters_schema: Any = EditFileParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        file_path = (repo_root / params["file_path"]).resolve()

        if not file_path.is_relative_to(repo_root):
            return ToolResult(success=False, error="Security violation: Path outside repository", permission_level=self.permission)

        if not file_path.exists():
            return ToolResult(success=False, error=f"File '{params['file_path']}' not found", permission_level=self.permission)

        old_content = file_path.read_text(encoding="utf-8", errors="replace")
        new_content = params["new_content"]

        # Generate standard unified diff
        diff_lines = list(
            difflib.unified_diff(
                old_content.splitlines(keepends=True),
                new_content.splitlines(keepends=True),
                fromfile=f"a/{params['file_path']}",
                tofile=f"b/{params['file_path']}",
            )
        )
        diff_text = "".join(diff_lines)

        # Write new content
        file_path.write_text(new_content, encoding="utf-8")

        return ToolResult(
            success=True,
            data={
                "file_path": params["file_path"],
                "explanation": params.get("explanation"),
                "diff": diff_text,
                "old_content": old_content,
                "new_content": new_content,
            },
            permission_level=self.permission,
        )


# --- rename_file ---
class RenameFileParams(BaseModel):
    old_path: str = Field(..., description="Current relative path")
    new_path: str = Field(..., description="New destination relative path")


class RenameFileTool(BaseTool):
    name: str = "rename_file"
    description: str = "Move or rename a file within the repository."
    permission: ToolPermission = ToolPermission.WRITE
    parameters_schema: Any = RenameFileParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        old_file = (repo_root / params["old_path"]).resolve()
        new_file = (repo_root / params["new_path"]).resolve()

        if not old_file.is_relative_to(repo_root) or not new_file.is_relative_to(repo_root):
            return ToolResult(success=False, error="Security violation: Path outside repository", permission_level=self.permission)

        if not old_file.exists():
            return ToolResult(success=False, error=f"Source file '{params['old_path']}' does not exist", permission_level=self.permission)

        new_file.parent.mkdir(parents=True, exist_ok=True)
        old_file.rename(new_file)

        return ToolResult(
            success=True,
            data={"old_path": params["old_path"], "new_path": params["new_path"], "renamed": True},
            permission_level=self.permission,
        )


# --- delete_file ---
class DeleteFileParams(BaseModel):
    file_path: str = Field(..., description="Relative path of file to remove")
    reason: str = Field(..., description="Justification for file removal")


class DeleteFileTool(BaseTool):
    name: str = "delete_file"
    description: str = "Remove a file from the repository. Always requires explicit human confirmation."
    permission: ToolPermission = ToolPermission.DESTRUCTIVE
    parameters_schema: Any = DeleteFileParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        file_path = (repo_root / params["file_path"]).resolve()

        if not file_path.is_relative_to(repo_root):
            return ToolResult(success=False, error="Security violation: Path outside repository", permission_level=self.permission)

        if not file_path.exists():
            return ToolResult(success=False, error=f"File '{params['file_path']}' does not exist", permission_level=self.permission)

        content_backup = file_path.read_text(encoding="utf-8", errors="replace")
        file_path.unlink()

        return ToolResult(
            success=True,
            data={"file_path": params["file_path"], "deleted": True, "reason": params["reason"], "backup": content_backup},
            permission_level=self.permission,
        )
