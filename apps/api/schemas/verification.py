"""
Pasha DevPilot — Verification & Pull Request Schemas
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class VerificationRequest(BaseModel):
    runner: Optional[str] = None  # pytest, npm, etc.
    custom_target: Optional[str] = None


class VerificationResponse(BaseModel):
    id: str
    task_id: str
    attempt_number: int
    runner: str
    command: str
    state: str  # PASSED, FAILED, TIMEOUT, BLOCKED
    exit_code: int
    output: str
    duration_ms: float
    executed_at: datetime


class PullRequestCreate(BaseModel):
    title: Optional[str] = None
    body_override: Optional[str] = None
    target_branch: str = "main"


class PullRequestResponse(BaseModel):
    id: str
    task_id: str
    title: str
    body: str
    head_branch: str
    base_branch: str
    pr_number: Optional[int] = None
    pr_url: Optional[str] = None
    status: str
    created_at: datetime
