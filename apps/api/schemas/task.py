"""
Pasha DevPilot — Task Schemas
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    repository_id: str
    title: str
    description: str
    classification_override: Optional[str] = None


class PlanApprovalRequest(BaseModel):
    approved: bool
    feedback: Optional[str] = None
    edited_plan: Optional[str] = None


class FileDiffItem(BaseModel):
    file_path: str
    change_type: str
    unified_diff: str
    original_content: Optional[str] = None
    new_content: Optional[str] = None
    is_reverted: bool = False


class TaskStepItem(BaseModel):
    id: str
    step_number: int
    name: str
    status: str
    description: Optional[str] = None


class VerificationRunItem(BaseModel):
    id: str
    attempt_number: int
    runner: str
    command: str
    state: str
    exit_code: Optional[int] = None
    output: Optional[str] = None
    duration_ms: float = 0.0
    executed_at: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    repository_id: str
    title: str
    description: str
    classification: str
    state: str
    current_mode: str
    branch_name: Optional[str] = None
    plan_markdown: Optional[str] = None
    is_approved: bool
    requires_approval: bool
    created_at: datetime
    updated_at: datetime
    file_changes: List[FileDiffItem] = Field(default_factory=list)
    steps: List[TaskStepItem] = Field(default_factory=list)
    verification_passed: Optional[bool] = None
    latest_verification: Optional[VerificationRunItem] = None
    verification_runs: List[VerificationRunItem] = Field(default_factory=list)
    pull_request_url: Optional[str] = None

