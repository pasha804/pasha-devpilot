"""
Pasha DevPilot — Typed Tool Core Architecture
Provides typed tools with 4-tier permission gates:
- READ: safe, read-only operations (no approval required)
- WRITE: state-altering local modifications (requires user approval before applying)
- EXTERNAL: network or external platform operations like PRs/webhooks (requires user confirmation)
- DESTRUCTIVE: file deletion, branch force, destructive operations (always requires explicit confirmation)
"""

from enum import Enum
from typing import Dict, Any, Callable, Optional, Awaitable, Type
from pydantic import BaseModel, Field, ConfigDict


class ToolPermission(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    EXTERNAL = "EXTERNAL"
    DESTRUCTIVE = "DESTRUCTIVE"


class ToolResult(BaseModel):
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    permission_level: ToolPermission
    audit_event: Optional[Dict[str, Any]] = None


class BaseTool(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    description: str
    permission: ToolPermission
    parameters_schema: Type[BaseModel]
    timeout_seconds: int = 30

    def get_json_schema(self) -> Dict[str, Any]:
        return self.parameters_schema.model_json_schema()

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        raise NotImplementedError("Subclasses must implement execute")
