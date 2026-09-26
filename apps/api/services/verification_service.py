"""
Pasha DevPilot — Verification Engine & Self-Healing Loop
Detects appropriate verification runners (pytest, npm test, ruff) and manages
bounded retry recovery loops (max 3 attempts).
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from .sandbox_service import ExecutionSandbox
from ..models.task import VerificationRun


class VerificationEngine:
    def __init__(self, repo_path: str, timeout_seconds: int = 60):
        self.repo_root = Path(repo_path).resolve()
        self.sandbox = ExecutionSandbox(repo_path, timeout_seconds=timeout_seconds)

    def detect_runner_command(self) -> Dict[str, Any]:
        """Detects the standard verification test command for the project."""
        if (self.repo_root / "pyproject.toml").exists() or (self.repo_root / "pytest.ini").exists() or any(self.repo_root.glob("test_*.py")):
            return {
                "runner": "pytest",
                "command_tokens": [sys.executable, "-m", "pytest", "-v"],
            }
        elif (self.repo_root / "package.json").exists():
            return {
                "runner": "npm test",
                "command_tokens": ["npm", "test"],
            }
        return {
            "runner": "none",
            "command_tokens": [],
        }

    async def run_verification(
        self,
        db: AsyncSession,
        task_id: str,
        attempt_number: int = 1,
        custom_command: Optional[str] = None,
    ) -> Dict[str, Any]:
        detected = self.detect_runner_command()
        if not detected["command_tokens"] and not custom_command:
            return {
                "state": "BLOCKED",
                "exit_code": -1,
                "output": "No supported test suite detected in repository.",
                "duration_ms": 0.0,
            }

        cmd_tokens = custom_command.split(" ") if custom_command else detected["command_tokens"]
        res = await self.sandbox.execute_safe_command(cmd_tokens)

        # Record verification run to database
        run_record = VerificationRun(
            task_id=task_id,
            attempt_number=attempt_number,
            runner=detected.get("runner", "custom"),
            command=" ".join(cmd_tokens),
            state=res["state"],
            exit_code=res["exit_code"],
            output=res["output"],
            duration_ms=res["duration_ms"],
        )
        db.add(run_record)
        await db.commit()

        return {
            "id": run_record.id,
            "task_id": task_id,
            "attempt_number": attempt_number,
            "runner": detected.get("runner", "custom"),
            "command": " ".join(cmd_tokens),
            "state": res["state"],
            "exit_code": res["exit_code"],
            "output": res["output"],
            "duration_ms": res["duration_ms"],
        }
