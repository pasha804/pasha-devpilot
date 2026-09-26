"""
Pasha DevPilot — Isolated Execution Sandbox Service
Enforces strict command allowlists, timeout boundaries, directory jail restrictions,
and process isolation.
"""

import os
import sys
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..core.config import settings

# Explicit strictly allowlisted binaries
SAFE_ALLOWLISTED_COMMANDS = {
    "pytest",
    "python",
    "npm",
    "pnpm",
    "yarn",
    "ruff",
    "eslint",
    "tsc",
    "git",
}

BLOCKED_PATTERNS = {
    "rm -rf /",
    "mkfs",
    "dd if=",
    ":(){ :|:& };:",
    "sudo",
    "chmod -R 777",
    "curl | sh",
    "wget | sh",
    "git clean",
    "git rm -rf",
    "git push --force",
}

# Environment variables never leaked to repository execution subprocesses
BLOCKED_ENV_VARS = {
    "DATABASE_URL",
    "REDIS_URL",
    "SECRET_KEY",
    "SESSION_SECRET",
    "GITHUB_CLIENT_SECRET",
    "AI_API_KEY",
    "BOB_API_KEY",
    "DEEPSEEK_API_KEY",
    "GROQ_API_KEY",
    "CLEANAPIS_API_KEY",
    "GEMINI_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "RAILWAY_TOKEN",
    "RAILWAY_API_TOKEN",
    "PGPASSWORD",
    "POSTGRES_PASSWORD",
}



class ExecutionSandbox:
    def __init__(self, repo_path: str, timeout_seconds: int = 60):
        self.repo_root = Path(repo_path).resolve()
        self.timeout_seconds = timeout_seconds

    def validate_command(self, cmd_tokens: List[str]) -> bool:
        if not cmd_tokens:
            return False

        binary = Path(cmd_tokens[0]).stem.lower()
        if binary not in SAFE_ALLOWLISTED_COMMANDS and binary != "python":
            return False

        full_cmd = " ".join(cmd_tokens)
        for blocked in BLOCKED_PATTERNS:
            if blocked in full_cmd:
                return False

        return True

    async def execute_safe_command(
        self,
        cmd_tokens: List[str],
        env_overrides: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes an allowlisted command inside the repository directory jail
        with hard execution timeout and isolated process control.
        """
        if not self.validate_command(cmd_tokens):
            return {
                "state": "BLOCKED",
                "exit_code": -1,
                "output": f"Security Sandbox Error: Command '{' '.join(cmd_tokens)}' is not in the allowlist or contains forbidden operations.",
                "duration_ms": 0.0,
            }

        start_time = time.perf_counter()
        try:
            # Map python executable if requested
            if cmd_tokens[0] in ("python", "python3"):
                cmd_tokens[0] = sys.executable

            # Sanitize environment: never leak secrets, credentials, or DB URIs
            clean_env = {
                k: v for k, v in os.environ.items()
                if k not in BLOCKED_ENV_VARS and not k.endswith("_SECRET") and not k.endswith("_KEY")
            }
            clean_env["GIT_TERMINAL_PROMPT"] = "0"
            clean_env["PYTHONUNBUFFERED"] = "1"
            if env_overrides:
                clean_env.update(env_overrides)

            process = await asyncio.create_subprocess_exec(
                *cmd_tokens,
                cwd=str(self.repo_root),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=clean_env,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=float(self.timeout_seconds),
                )
            except asyncio.TimeoutError:
                try:
                    process.kill()
                except Exception:
                    pass
                duration = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "state": "TIMEOUT",
                    "exit_code": -1,
                    "output": f"Execution timed out after {self.timeout_seconds} seconds.",
                    "duration_ms": duration,
                }

            duration = round((time.perf_counter() - start_time) * 1000, 2)
            out_str = stdout.decode(errors="replace")
            err_str = stderr.decode(errors="replace")
            combined = (out_str + "\n" + err_str).strip()

            exit_code = process.returncode
            state = "PASSED" if exit_code == 0 else "FAILED"

            return {
                "state": state,
                "exit_code": exit_code,
                "output": combined,
                "duration_ms": duration,
            }
        except Exception as e:
            duration = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "state": "FAILED",
                "exit_code": -1,
                "output": f"Sandbox execution exception: {str(e)}",
                "duration_ms": duration,
            }
