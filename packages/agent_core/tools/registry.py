"""
Pasha DevPilot — Tool Registry
Centralized registry for tool registration, discovery, validation, and execution.
"""

import time
import asyncio
from typing import Dict, Any, List, Optional
from .base import BaseTool, ToolPermission, ToolResult
from ..providers.base import ToolDefinition


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_all(self) -> List[BaseTool]:
        return list(self._tools.values())

    def get_definitions(self) -> List[ToolDefinition]:
        return [
            ToolDefinition(
                name=t.name,
                description=f"[{t.permission.value}] {t.description}",
                parameters=t.get_json_schema(),
            )
            for t in self._tools.values()
        ]

    async def execute(
        self,
        name: str,
        params: Dict[str, Any],
        context: Dict[str, Any],
        require_approval_cb: Optional[Any] = None,
    ) -> ToolResult:
        tool = self.get(name)
        if not tool:
            return ToolResult(
                success=False,
                error=f"Tool '{name}' not found in registry",
                permission_level=ToolPermission.READ,
            )

        # Check permissions
        if tool.permission in (ToolPermission.WRITE, ToolPermission.EXTERNAL, ToolPermission.DESTRUCTIVE):
            if not context.get("approved", False):
                return ToolResult(
                    success=False,
                    error=f"Approval required for tool '{name}' ({tool.permission.value}). Action is pending human confirmation.",
                    permission_level=tool.permission,
                )

        start = time.perf_counter()
        try:
            # Validate input params against Pydantic model
            validated_params = tool.parameters_schema(**params).model_dump()
            res = await asyncio.wait_for(
                tool.execute(validated_params, context),
                timeout=float(tool.timeout_seconds),
            )
            res.execution_time_ms = round((time.perf_counter() - start) * 1000, 2)
            return res
        except asyncio.TimeoutError:
            return ToolResult(
                success=False,
                error=f"Tool '{name}' timed out after {tool.timeout_seconds}s",
                execution_time_ms=round((time.perf_counter() - start) * 1000, 2),
                permission_level=tool.permission,
            )
        except Exception as e:
            return ToolResult(
                success=False,
                error=f"Execution error in '{name}': {str(e)}",
                execution_time_ms=round((time.perf_counter() - start) * 1000, 2),
                permission_level=tool.permission,
            )
