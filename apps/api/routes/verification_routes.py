"""
Pasha DevPilot — Verification Execution & History Routes
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..models.task import Task, VerificationRun
from ..models.repository import Repository
from ..schemas.verification import VerificationRequest, VerificationResponse
from ..services.verification_service import VerificationEngine

router = APIRouter(prefix="/tasks", tags=["Verification"])


@router.post("/{task_id}/verify", response_model=VerificationResponse)
async def run_manual_verification(
    task_id: str,
    payload: VerificationRequest,
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

    verifier = VerificationEngine(repo.local_path or ".")
    result = await verifier.run_verification(
        db,
        task_id=task.id,
        attempt_number=1,
        custom_command=payload.custom_target,
    )

    return VerificationResponse(
        id=result["id"],
        task_id=task.id,
        attempt_number=result["attempt_number"],
        runner=result["runner"],
        command=result["command"],
        state=result["state"],
        exit_code=result["exit_code"],
        output=result["output"],
        duration_ms=result["duration_ms"],
        executed_at=result.get("executed_at", task.updated_at),
    )


@router.get("/{task_id}/verification-history", response_model=List[VerificationResponse])
async def get_verification_history(task_id: str, db: AsyncSession = Depends(get_db)):
    q = await db.execute(
        select(VerificationRun)
        .where(VerificationRun.task_id == task_id)
        .order_by(VerificationRun.attempt_number.desc())
    )
    runs = q.scalars().all()
    return [
        VerificationResponse(
            id=r.id,
            task_id=r.task_id,
            attempt_number=r.attempt_number,
            runner=r.runner,
            command=r.command,
            state=r.state,
            exit_code=r.exit_code or 0,
            output=r.output or "",
            duration_ms=r.duration_ms or 0.0,
            executed_at=r.executed_at,
        )
        for r in runs
    ]
