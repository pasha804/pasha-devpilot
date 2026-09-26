"""
Pasha DevPilot — Task Management & Approval Routes
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..core.security import decode_access_token
from ..core.audit import record_audit_log
from ..models.task import Task, TaskStep, FileChange, VerificationRun, PullRequest
from ..models.repository import Repository
from ..models.user import User
from ..schemas.task import TaskCreate, TaskResponse, PlanApprovalRequest, FileDiffItem, TaskStepItem, VerificationRunItem
from ..services.event_bus import event_bus

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    repository_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
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

    stmt = (
        select(Task)
        .join(Repository, Task.repository_id == Repository.id, isouter=True)
        .order_by(Task.created_at.desc())
    )
    if repository_id:
        stmt = stmt.where(Task.repository_id == repository_id)

    if not current_username:
        # Unauthenticated: only show tasks belonging to public repositories or demo repositories
        stmt = stmt.where((Repository.is_private == False) | (Task.repository_id == None))
    else:
        # Authenticated: show tasks for user's own repositories or public repositories
        stmt = stmt.where(
            (Repository.owner == current_username) | (Repository.is_private == False) | (Task.repository_id == None)
        )

    q = await db.execute(stmt)
    tasks = q.scalars().all()

    results = []
    for t in tasks:
        # Auto-heal any task that has a formulated plan but got stuck in PLANNING, UNDERSTANDING, or INVESTIGATING
        if t.state in ("PLANNING", "UNDERSTANDING", "INVESTIGATING") and t.plan_markdown and len(t.plan_markdown.strip()) > 30:
            t.state = "WAITING_FOR_APPROVAL"
            await db.commit()

        # Auto-heal any task where verification passed but state was mistakenly marked FAILED
        q_v_check = await db.execute(
            select(VerificationRun).where(VerificationRun.task_id == t.id).order_by(VerificationRun.attempt_number.desc())
        )
        last_v_check = q_v_check.scalars().first()
        if t.state == "FAILED" and last_v_check and last_v_check.state == "PASSED":
            t.state = "READY_TO_SHIP"
            await db.commit()

        # Load steps and changes
        q_steps = await db.execute(select(TaskStep).where(TaskStep.task_id == t.id).order_by(TaskStep.step_number.asc()))
        steps = q_steps.scalars().all()

        q_changes = await db.execute(select(FileChange).where(FileChange.task_id == t.id))
        changes = q_changes.scalars().all()

        q_pr = await db.execute(
            select(PullRequest).where(PullRequest.task_id == t.id).order_by(PullRequest.created_at.desc())
        )
        last_pr = q_pr.scalars().first()

        results.append(
            TaskResponse(
                id=t.id,
                repository_id=t.repository_id,
                title=t.title,
                description=t.description,
                classification=t.classification,
                state=t.state,
                current_mode=t.current_mode,
                branch_name=t.branch_name,
                plan_markdown=t.plan_markdown,
                is_approved=t.is_approved,
                requires_approval=t.requires_approval,
                created_at=t.created_at,
                updated_at=t.updated_at,
                steps=[TaskStepItem(id=s.id, step_number=s.step_number, name=s.name, status=s.status, description=s.description) for s in steps],
                file_changes=[FileDiffItem(file_path=c.file_path, change_type=c.change_type, unified_diff=c.unified_diff or "", original_content=c.original_content, new_content=c.new_content, is_reverted=c.is_reverted) for c in changes],
                pull_request_url=last_pr.pr_url if last_pr else None,
            )
        )
    return results


@router.post("", response_model=TaskResponse)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new engineering task on a repository."""
    q_repo = await db.execute(select(Repository).where(Repository.id == payload.repository_id))
    repo = q_repo.scalars().first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Simple classification heuristic for initial model
    d = payload.description.lower()
    classification = payload.classification_override or (
        "BUG_FIX" if any(w in d for w in ("fix", "bug", "error", "fail", "broken"))
        else ("REFACTOR" if "refactor" in d else ("TEST" if "test" in d else "FEATURE"))
    )

    task = Task(
        repository_id=repo.id,
        title=payload.title,
        description=payload.description,
        classification=classification,
        state="NEW",
        current_mode="ANALYZE",
        requires_approval=True,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Initial standard steps
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
            status="PENDING" if num > 1 else "RUNNING",
        )
        db.add(s)

    await db.commit()
    await record_audit_log(db, action="CREATE_TASK", resource_type="TASK", resource_id=task.id)

    return TaskResponse(
        id=task.id,
        repository_id=task.repository_id,
        title=task.title,
        description=task.description,
        classification=task.classification,
        state=task.state,
        current_mode=task.current_mode,
        branch_name=task.branch_name,
        plan_markdown=task.plan_markdown,
        is_approved=task.is_approved,
        requires_approval=task.requires_approval,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_details(task_id: str, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Task).where(Task.id == task_id))
    task = q.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    q_steps = await db.execute(select(TaskStep).where(TaskStep.task_id == task.id).order_by(TaskStep.step_number.asc()))
    steps = q_steps.scalars().all()

    # Auto-heal any task that has a formulated plan but got stuck in PLANNING, UNDERSTANDING, or INVESTIGATING
    if task.state in ("PLANNING", "UNDERSTANDING", "INVESTIGATING") and task.plan_markdown and len(task.plan_markdown.strip()) > 30:
        task.state = "WAITING_FOR_APPROVAL"
        for s in steps:
            if s.step_number < 4:
                s.status = "COMPLETED"
            elif s.step_number == 4:
                s.status = "RUNNING"
        await db.commit()

    q_changes = await db.execute(select(FileChange).where(FileChange.task_id == task.id))
    changes = q_changes.scalars().all()

    q_v = await db.execute(
        select(VerificationRun).where(VerificationRun.task_id == task.id).order_by(VerificationRun.attempt_number.desc())
    )
    all_v = q_v.scalars().all()
    last_v = all_v[0] if all_v else None

    # Auto-heal any task where verification passed but state was mistakenly marked FAILED
    if task.state == "FAILED" and last_v and last_v.state == "PASSED":
        task.state = "READY_TO_SHIP"
        task.current_mode = "REVIEW"
        for s in steps:
            if s.step_number <= 6:
                s.status = "COMPLETED"
            elif s.step_number == 7:
                s.status = "RUNNING"
        await db.commit()

    latest_v_item = None
    if last_v:
        latest_v_item = VerificationRunItem(
            id=last_v.id,
            attempt_number=last_v.attempt_number,
            runner=last_v.runner,
            command=last_v.command,
            state=last_v.state,
            exit_code=last_v.exit_code,
            output=last_v.output,
            duration_ms=last_v.duration_ms,
            executed_at=last_v.executed_at,
        )

    v_run_items = [
        VerificationRunItem(
            id=v.id,
            attempt_number=v.attempt_number,
            runner=v.runner,
            command=v.command,
            state=v.state,
            exit_code=v.exit_code,
            output=v.output,
            duration_ms=v.duration_ms,
            executed_at=v.executed_at,
        )
        for v in all_v
    ]

    q_pr = await db.execute(
        select(PullRequest).where(PullRequest.task_id == task.id).order_by(PullRequest.created_at.desc())
    )
    last_pr = q_pr.scalars().first()

    return TaskResponse(
        id=task.id,
        repository_id=task.repository_id,
        title=task.title,
        description=task.description,
        classification=task.classification,
        state=task.state,
        current_mode=task.current_mode,
        branch_name=task.branch_name,
        plan_markdown=task.plan_markdown,
        is_approved=task.is_approved,
        requires_approval=task.requires_approval,
        created_at=task.created_at,
        updated_at=task.updated_at,
        steps=[TaskStepItem(id=s.id, step_number=s.step_number, name=s.name, status=s.status, description=s.description) for s in steps],
        file_changes=[FileDiffItem(file_path=c.file_path, change_type=c.change_type, unified_diff=c.unified_diff or "", original_content=c.original_content, new_content=c.new_content, is_reverted=c.is_reverted) for c in changes],
        verification_passed=(last_v.state == "PASSED") if last_v else None,
        latest_verification=latest_v_item,
        verification_runs=v_run_items,
        pull_request_url=last_pr.pr_url if last_pr else None,
    )


@router.post("/{task_id}/approve", response_model=TaskResponse)
async def approve_task_plan(
    task_id: str,
    payload: PlanApprovalRequest,
    db: AsyncSession = Depends(get_db),
):
    """Human approval gate checkpoint."""
    q = await db.execute(select(Task).where(Task.id == task_id))
    task = q.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_approved = payload.approved
    if payload.approved:
        task.approved_at = datetime.now(timezone.utc)
        task.current_mode = "BUILD"
        task.state = "IMPLEMENTING"
        if payload.edited_plan:
            task.plan_markdown = payload.edited_plan
        action = "APPROVE_PLAN"
    else:
        task.state = "CANCELLED"
        task.current_mode = "IDLE"
        action = "REJECT_PLAN"

    await db.commit()
    await record_audit_log(db, action=action, resource_type="TASK", resource_id=task.id, metadata={"feedback": payload.feedback})

    # Broadcast events
    await event_bus.publish(
        task.id,
        {
            "task_id": task.id,
            "event_type": "approval_status",
            "state": task.state,
            "message": "Human approval recorded" if payload.approved else "Plan was declined",
            "payload": {"approved": payload.approved},
        },
    )
    await event_bus.publish(
        task.id,
        {
            "task_id": task.id,
            "event_type": "state_change",
            "state": task.state,
            "message": f"Task state transitioned to {task.state}",
            "payload": {"state": task.state, "approved": payload.approved},
        },
    )

    return await get_task_details(task_id, db)

@router.post("/{task_id}/cancel", response_model=TaskResponse)
async def cancel_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Cancel a task that is waiting or in-progress."""
    q = await db.execute(select(Task).where(Task.id == task_id))
    task = q.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.state in ("COMPLETED", "CANCELLED"):
        raise HTTPException(status_code=400, detail=f"Task is already {task.state}")

    task.state = "CANCELLED"
    await db.commit()
    await record_audit_log(db, action="CANCEL_TASK", resource_type="TASK", resource_id=task.id)

    # Broadcast cancellation
    await event_bus.publish(
        task.id,
        {
            "task_id": task.id,
            "event_type": "state_change",
            "state": "CANCELLED",
            "message": "Task cancelled by user",
            "payload": {},
        },
    )

    return await get_task_details(task_id, db)


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Mark an engineering task as finished / completed, moving it to Total Work Done."""
    q = await db.execute(select(Task).where(Task.id == task_id))
    task = q.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.state = "COMPLETED"
    task.current_mode = "COMPLETED"
    task.completed_at = datetime.now(timezone.utc)

    # Mark all steps completed
    q_steps = await db.execute(select(TaskStep).where(TaskStep.task_id == task.id))
    for step in q_steps.scalars().all():
        step.status = "COMPLETED"
        step.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await record_audit_log(db, action="COMPLETE_TASK", resource_type="TASK", resource_id=task.id)

    # Broadcast completion
    await event_bus.publish(
        task.id,
        {
            "task_id": task.id,
            "event_type": "state_change",
            "state": "COMPLETED",
            "message": "Task work completed and recorded in Total Work Done",
            "payload": {"state": "COMPLETED"},
        },
    )

    return await get_task_details(task_id, db)

