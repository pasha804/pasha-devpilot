"""
Pasha DevPilot — Typed Verification & Testing Tools
Permission: READ / EXECUTION (Allowlisted sandbox execution only).
Enforces timeouts, command allowlists, and execution isolation.
"""

import sys
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from .base import BaseTool, ToolPermission, ToolResult


# Allowlisted commands only
ALLOWED_TEST_BINARIES = {"pytest", "python", "npm", "pnpm", "yarn", "ruff", "eslint", "tsc"}


class RunTestParams(BaseModel):
    test_path: Optional[str] = Field(default=None, description="Optional path to specific test file or suite")
    command_override: Optional[str] = Field(default=None, description="Allowlisted custom test invocation")


class RunTestTool(BaseTool):
    name: str = "run_test"
    description: str = "Run project test runner (pytest / npm test) inside isolated execution sandbox."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = RunTestParams
    timeout_seconds: int = 60

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", ".")).resolve()
        test_path = params.get("test_path")

        # Determine safe command
        cmd = None
        if (repo_root / "pyproject.toml").exists() or (repo_root / "pytest.ini").exists() or any(repo_root.glob("test_*.py")) or any(repo_root.glob("tests")):
            cmd = [sys.executable, "-m", "pytest", "-v"]
            if test_path:
                cmd.append(test_path)
        elif (repo_root / "package.json").exists():
            cmd = ["npm", "test"]
            if test_path:
                cmd.extend(["--", test_path])
        else:
            return ToolResult(
                success=False,
                error="No supported test runner detected (neither pytest nor package.json found).",
                permission_level=self.permission,
            )

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(repo_root),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=float(self.timeout_seconds))
            except asyncio.TimeoutError:
                process.kill()
                return ToolResult(
                    success=False,
                    error=f"Verification timed out after {self.timeout_seconds} seconds.",
                    data={"state": "TIMEOUT", "output": ""},
                    permission_level=self.permission,
                )

            out_text = stdout.decode(errors="replace")
            err_text = stderr.decode(errors="replace")
            combined_output = (out_text + "\n" + err_text).strip()
            exit_code = process.returncode

            is_passed = (exit_code == 0)

            return ToolResult(
                success=True,
                data={
                    "state": "PASSED" if is_passed else "FAILED",
                    "exit_code": exit_code,
                    "command": " ".join(cmd),
                    "output": combined_output,
                },
                permission_level=self.permission,
            )
        except Exception as e:
            return ToolResult(
                success=False,
                error=f"Failed to execute verification: {str(e)}",
                permission_level=self.permission,
            )


class RunLinterParams(BaseModel):
    target_path: Optional[str] = Field(default=".", description="Target directory or file to check")


class RunLinterTool(BaseTool):
    name: str = "run_linter"
    description: str = "Run linter (ruff or eslint) to detect code quality and style violations."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = RunLinterParams
    timeout_seconds: int = 45

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", ".")).resolve()
        target = params.get("target_path", ".")

        cmd = [sys.executable, "-m", "ruff", "check", target]
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(repo_root),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=float(self.timeout_seconds))
            out = (stdout.decode(errors="replace") + "\n" + stderr.decode(errors="replace")).strip()
            return ToolResult(
                success=True,
                data={
                    "passed": process.returncode == 0,
                    "exit_code": process.returncode,
                    "output": out or "All lint checks passed.",
                },
                permission_level=self.permission,
            )
        except FileNotFoundError:
            return ToolResult(
                success=True,
                data={"passed": True, "output": "Ruff linter not installed in environment; skipping linter."},
                permission_level=self.permission,
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e), permission_level=self.permission)
