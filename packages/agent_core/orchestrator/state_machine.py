"""
Pasha DevPilot — Agent State Machine
Defines the deterministic lifecycle states, task classifications, and agent operational modes.
"""

from enum import Enum


class TaskState(str, Enum):
    NEW = "NEW"
    UNDERSTANDING = "UNDERSTANDING"
    INVESTIGATING = "INVESTIGATING"
    PLANNING = "PLANNING"
    WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL"
    IMPLEMENTING = "IMPLEMENTING"
    VERIFYING = "VERIFYING"
    REVIEWING = "REVIEWING"
    READY_TO_SHIP = "READY_TO_SHIP"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    CANCELLED = "CANCELLED"


class TaskClassification(str, Enum):
    BUG_FIX = "BUG_FIX"
    FEATURE = "FEATURE"
    REFACTOR = "REFACTOR"
    TEST = "TEST"
    DOCUMENTATION = "DOCUMENTATION"
    CODE_REVIEW = "CODE_REVIEW"
    EXPLANATION = "EXPLANATION"
    REPOSITORY_ANALYSIS = "REPOSITORY_ANALYSIS"
    SECURITY = "SECURITY"
    PERFORMANCE = "PERFORMANCE"
    UNKNOWN = "UNKNOWN"


class AgentMode(str, Enum):
    ANALYZE = "ANALYZE"
    BUILD = "BUILD"
    TEST = "TEST"
    REVIEW = "REVIEW"
    SHIP = "SHIP"


class VerificationState(str, Enum):
    NOT_RUN = "NOT_RUN"
    RUNNING = "RUNNING"
    PASSED = "PASSED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    TIMEOUT = "TIMEOUT"
    UNKNOWN = "UNKNOWN"
