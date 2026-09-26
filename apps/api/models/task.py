"""
Pasha DevPilot — Task, Agent, Verification, and Pull Request Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repository_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    classification = Column(String(64), default="BUG_FIX")
    state = Column(String(64), default="NEW")  # TaskState
    current_mode = Column(String(32), default="ANALYZE")
    branch_name = Column(String(255), nullable=True)
    plan_markdown = Column(Text, nullable=True)
    requires_approval = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    repository = relationship("Repository", back_populates="tasks")
    steps = relationship("TaskStep", back_populates="task", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="task", cascade="all, delete-orphan")
    file_changes = relationship("FileChange", back_populates="task", cascade="all, delete-orphan")
    verification_runs = relationship("VerificationRun", back_populates="task", cascade="all, delete-orphan")
    pull_requests = relationship("PullRequest", back_populates="task", cascade="all, delete-orphan")


class TaskStep(Base):
    __tablename__ = "task_steps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED, SKIPPED
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    task = relationship("Task", back_populates="steps")
    tool_calls = relationship("ToolCall", back_populates="step", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    model_provider = Column(String(64), default="mock")
    model_name = Column(String(128), default="devpilot-v1")
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    duration_ms = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="agent_runs")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    step_id = Column(String(36), ForeignKey("task_steps.id"), nullable=True)
    tool_name = Column(String(128), nullable=False)
    permission_level = Column(String(32), default="READ")
    arguments_json = Column(Text, nullable=False)
    result_json = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Float, default=0.0)
    is_success = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    executed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    step = relationship("TaskStep", back_populates="tool_calls")


class FileChange(Base):
    __tablename__ = "file_changes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    file_path = Column(String(1024), nullable=False)
    change_type = Column(String(32), default="MODIFIED")  # ADDED, MODIFIED, DELETED, RENAMED
    unified_diff = Column(Text, nullable=True)
    original_content = Column(Text, nullable=True)
    new_content = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_reverted = Column(Boolean, default=False)
    reverted_at = Column(DateTime(timezone=True), nullable=True)

    task = relationship("Task", back_populates="file_changes")


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    attempt_number = Column(Integer, default=1)
    runner = Column(String(64), default="pytest")  # pytest, npm test, ruff, eslint
    command = Column(String(512), nullable=False)
    state = Column(String(32), default="NOT_RUN")  # NOT_RUN, RUNNING, PASSED, FAILED, TIMEOUT, BLOCKED
    exit_code = Column(Integer, nullable=True)
    output = Column(Text, nullable=True)
    duration_ms = Column(Float, default=0.0)
    executed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="verification_runs")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    pr_number = Column(Integer, nullable=True)
    title = Column(String(512), nullable=False)
    body = Column(Text, nullable=False)
    head_branch = Column(String(255), nullable=False)
    base_branch = Column(String(255), default="main")
    pr_url = Column(String(1024), nullable=True)
    status = Column(String(32), default="OPEN")  # OPEN, MERGED, CLOSED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="pull_requests")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action = Column(String(128), index=True, nullable=False)
    user_id = Column(String(36), nullable=True)
    workspace_id = Column(String(36), nullable=True)
    resource_type = Column(String(64), nullable=True)
    resource_id = Column(String(128), nullable=True)
    status = Column(String(32), default="SUCCESS")
    audit_metadata = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), nullable=False)
    task_id = Column(String(36), nullable=True)
    model_provider = Column(String(64), nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
