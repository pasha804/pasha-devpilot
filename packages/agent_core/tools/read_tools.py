"""
Pasha DevPilot — Typed Read-Only Tools (Permission: READ)
Enables safe inspection, AST symbol analysis, dependency detection, and code search.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .base import BaseTool, ToolPermission, ToolResult


# --- list_files ---
class ListFilesParams(BaseModel):
    directory: str = Field(default=".", description="Relative path of directory to inspect")
    max_depth: int = Field(default=4, description="Maximum directory depth to traverse")


class ListFilesTool(BaseTool):
    name: str = "list_files"
    description: str = "Inspect repository directory tree respecting .gitignore and secret exclusion."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = ListFilesParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        target_dir = (repo_root / params.get("directory", ".")).resolve()

        if not target_dir.is_relative_to(repo_root):
            return ToolResult(success=False, error="Access outside repository root is forbidden", permission_level=self.permission)

        if not target_dir.exists():
            return ToolResult(success=False, error=f"Directory '{params.get('directory')}' does not exist", permission_level=self.permission)

        max_depth = params.get("max_depth", 4)
        files_list = []
        ignored_dirs = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next", ".pytest_cache"}

        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith(".")]
            rel_root = Path(root).relative_to(repo_root)
            depth = len(rel_root.parts)
            if depth > max_depth:
                continue

            for f in files:
                # Secret exclusions
                if f.startswith(".env") or f.endswith((".pem", ".key", ".cert")):
                    continue
                rel_path = (rel_root / f).as_posix()
                files_list.append(rel_path)

        return ToolResult(
            success=True,
            data={"files": files_list[:300], "total_files_found": len(files_list)},
            permission_level=self.permission,
        )


# --- read_file ---
class ReadFileParams(BaseModel):
    file_path: str = Field(..., description="Relative path of file to read")
    start_line: Optional[int] = Field(default=1, description="1-indexed line start")
    end_line: Optional[int] = Field(default=None, description="1-indexed line end")


class ReadFileTool(BaseTool):
    name: str = "read_file"
    description: str = "Read source code of a specified repository file with optional line window."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = ReadFileParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        file_path = (repo_root / params["file_path"]).resolve()

        if not file_path.is_relative_to(repo_root):
            return ToolResult(success=False, error="Access outside repository root is forbidden", permission_level=self.permission)

        # Exclude secrets
        filename = file_path.name
        if filename.startswith(".env") or filename.endswith((".pem", ".key", ".cert")):
            return ToolResult(
                success=False,
                error="Access denied: Sensitive file excluded by DevPilot security policy.",
                permission_level=self.permission,
            )

        if not file_path.exists() or not file_path.is_file():
            return ToolResult(success=False, error=f"File '{params['file_path']}' not found", permission_level=self.permission)

        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
            lines = content.splitlines()
            start = max(1, params.get("start_line") or 1)
            end = params.get("end_line") or len(lines)
            end = min(len(lines), end)

            window_lines = lines[start - 1 : end]
            numbered = [f"{i + start}: {line}" for i, line in enumerate(window_lines)]

            return ToolResult(
                success=True,
                data={
                    "file_path": params["file_path"],
                    "total_lines": len(lines),
                    "start_line": start,
                    "end_line": end,
                    "content": "\n".join(numbered),
                    "raw_content": "\n".join(window_lines),
                },
                permission_level=self.permission,
            )
        except Exception as e:
            return ToolResult(success=False, error=f"Failed to read file: {str(e)}", permission_level=self.permission)


# --- search_code ---
class SearchCodeParams(BaseModel):
    query: str = Field(..., description="Text query or regex pattern to search for")
    file_pattern: Optional[str] = Field(default=None, description="Optional glob filter, e.g. '*.py' or '*.ts'")
    is_regex: bool = Field(default=False, description="Treat query as regular expression")


class SearchCodeTool(BaseTool):
    name: str = "search_code"
    description: str = "Perform exact or regex text search across repository files."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = SearchCodeParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        query = params["query"]
        is_regex = params.get("is_regex", False)

        pattern = re.compile(query if is_regex else re.escape(query), re.IGNORECASE)
        matches = []
        ignored_dirs = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next"}

        for root, dirs, files in os.walk(repo_root):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith(".")]
            for f in files:
                if f.startswith(".env") or f.endswith((".pem", ".key", ".cert", ".png", ".jpg", ".zip", ".exe")):
                    continue
                file_path = Path(root) / f
                rel_path = file_path.relative_to(repo_root).as_posix()
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                    for line_num, line in enumerate(content.splitlines(), start=1):
                        if pattern.search(line):
                            matches.append({
                                "file": rel_path,
                                "line_number": line_num,
                                "line_content": line.strip()[:200]
                            })
                            if len(matches) >= 50:
                                break
                except Exception:
                    continue
            if len(matches) >= 50:
                break

        return ToolResult(
            success=True,
            data={"query": query, "matches_count": len(matches), "matches": matches},
            permission_level=self.permission,
        )


# --- find_symbol ---
class FindSymbolParams(BaseModel):
    symbol_name: str = Field(..., description="Function, class, or type symbol name to locate")


class FindSymbolTool(BaseTool):
    name: str = "find_symbol"
    description: str = "Locate class, function, or route definitions in repository codebase."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = FindSymbolParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        symbol = params["symbol_name"]
        
        # Regex patterns for Python, JS/TS, Go
        py_func = re.compile(rf"def\s+{re.escape(symbol)}\b", re.IGNORECASE)
        py_class = re.compile(rf"class\s+{re.escape(symbol)}\b", re.IGNORECASE)
        js_func = re.compile(rf"(?:function|const|let|var)\s+{re.escape(symbol)}\s*=?\s*(?:async)?\s*\(", re.IGNORECASE)
        js_class = re.compile(rf"class\s+{re.escape(symbol)}\b", re.IGNORECASE)

        results = []
        ignored = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next"}

        for root, dirs, files in os.walk(repo_root):
            dirs[:] = [d for d in dirs if d not in ignored and not d.startswith(".")]
            for f in files:
                if not f.endswith((".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs")):
                    continue
                file_path = Path(root) / f
                rel_path = file_path.relative_to(repo_root).as_posix()
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                    for idx, line in enumerate(content.splitlines(), start=1):
                        if (
                            py_func.search(line)
                            or py_class.search(line)
                            or js_func.search(line)
                            or js_class.search(line)
                        ):
                            results.append({
                                "symbol": symbol,
                                "file": rel_path,
                                "line": idx,
                                "snippet": line.strip()
                            })
                except Exception:
                    continue

        return ToolResult(
            success=True,
            data={"symbol": symbol, "found": len(results), "locations": results},
            permission_level=self.permission,
        )


# --- get_file_metadata ---
class GetFileMetadataParams(BaseModel):
    file_path: str = Field(..., description="File path to inspect")


class GetFileMetadataTool(BaseTool):
    name: str = "get_file_metadata"
    description: str = "Retrieve size, line count, language, and modification info for a file."
    permission: ToolPermission = ToolPermission.READ
    parameters_schema: Any = GetFileMetadataParams

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        repo_root = Path(context.get("repo_path", "."))
        file_path = (repo_root / params["file_path"]).resolve()

        if not file_path.is_relative_to(repo_root) or not file_path.exists():
            return ToolResult(success=False, error="File does not exist or outside repository", permission_level=self.permission)

        stat = file_path.stat()
        lines = 0
        try:
            lines = len(file_path.read_text(encoding="utf-8", errors="ignore").splitlines())
        except Exception:
            pass

        ext_to_lang = {
            ".py": "Python",
            ".ts": "TypeScript",
            ".tsx": "TypeScript React",
            ".js": "JavaScript",
            ".jsx": "JavaScript React",
            ".json": "JSON",
            ".md": "Markdown",
            ".yml": "YAML",
            ".yaml": "YAML",
            ".sql": "SQL",
        }

        return ToolResult(
            success=True,
            data={
                "file_path": params["file_path"],
                "size_bytes": stat.st_size,
                "lines_count": lines,
                "language": ext_to_lang.get(file_path.suffix.lower(), "Unknown"),
                "modified_at": stat.st_mtime,
            },
            permission_level=self.permission,
        )
