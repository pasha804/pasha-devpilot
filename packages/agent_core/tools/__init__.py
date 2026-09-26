from .base import ToolPermission, ToolResult, BaseTool
from .registry import ToolRegistry
from .read_tools import (
    ListFilesTool,
    ReadFileTool,
    SearchCodeTool,
    FindSymbolTool,
    GetFileMetadataTool,
)
from .write_tools import (
    CreateFileTool,
    EditFileTool,
    RenameFileTool,
    DeleteFileTool,
)
from .test_tools import (
    RunTestTool,
    RunLinterTool,
)
from .git_tools import (
    CreateBranchTool,
    CommitChangesTool,
    CreatePullRequestTool,
)


def get_default_tool_registry() -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(ListFilesTool())
    registry.register(ReadFileTool())
    registry.register(SearchCodeTool())
    registry.register(FindSymbolTool())
    registry.register(GetFileMetadataTool())
    registry.register(CreateFileTool())
    registry.register(EditFileTool())
    registry.register(RenameFileTool())
    registry.register(DeleteFileTool())
    registry.register(RunTestTool())
    registry.register(RunLinterTool())
    registry.register(CreateBranchTool())
    registry.register(CommitChangesTool())
    registry.register(CreatePullRequestTool())
    return registry


__all__ = [
    "ToolPermission",
    "ToolResult",
    "BaseTool",
    "ToolRegistry",
    "get_default_tool_registry",
]
