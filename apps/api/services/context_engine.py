"""
Pasha DevPilot — Dedicated Context Engine
Retrieves relevant repository files, ranks context, filters secrets, applies token budgeting,
and constructs high-signal context packets for the agent orchestrator.
"""

from pathlib import Path
from typing import List, Dict, Any, Tuple
from .search_service import CodeSearchService
from ..core.security import contains_secret


class ContextEngine:
    def __init__(self, repo_path: str, max_context_chars: int = 24000):
        self.repo_root = Path(repo_path).resolve()
        self.search = CodeSearchService(repo_path)
        self.max_context_chars = max_context_chars

    async def build_context_for_task(
        self,
        task_description: str,
        classification: str,
    ) -> Dict[str, Any]:
        """
        Executes pipeline: Search -> Rank -> Filter Secrets -> Truncate Budget -> Assembled Context
        """
        # Step 1: Semantic & exact search
        semantic_matches = await self.search.semantic_intent_search(task_description, limit=10)
        exact_matches = await self.search.exact_search(task_description[:30], limit=5)

        # Collect unique candidate file paths
        candidate_paths = set()
        for m in semantic_matches:
            candidate_paths.add(m.file_path)
        for m in exact_matches:
            candidate_paths.add(m.file_path)

        # Step 2: Read candidate files, filter sensitive files, rank by priority
        ranked_files: List[Dict[str, Any]] = []
        for rel_path in candidate_paths:
            fpath = self.repo_root / rel_path
            if not fpath.exists() or not fpath.is_file():
                continue

            # Secret exclusion
            if rel_path.startswith(".env") or fpath.suffix in (".pem", ".key", ".cert"):
                continue

            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                if contains_secret(content):
                    continue

                # Score priority: tests get high rank for bug fixes, models/routes for features
                priority_bonus = 1.0
                if classification == "BUG_FIX" and "test" in rel_path.lower():
                    priority_bonus += 2.0
                elif classification == "FEATURE" and any(k in rel_path.lower() for k in ("service", "route", "model")):
                    priority_bonus += 2.0

                ranked_files.append({
                    "path": rel_path,
                    "content": content,
                    "length": len(content),
                    "priority": priority_bonus,
                })
            except Exception:
                continue

        ranked_files.sort(key=lambda x: x["priority"], reverse=True)

        # Step 3: Assemble into token-budgeted string
        current_chars = 0
        included_files = []
        context_blocks = []

        for item in ranked_files:
            file_len = item["length"]
            if current_chars + min(file_len, 4000) > self.max_context_chars:
                break

            truncated_content = item["content"][:4000]
            if len(item["content"]) > 4000:
                truncated_content += "\n... [Remaining lines truncated by Context Engine for token budget] ..."

            block = f"--- FILE: {item['path']} ---\n{truncated_content}\n"
            context_blocks.append(block)
            current_chars += len(block)
            included_files.append(item["path"])

        assembled_context = "\n".join(context_blocks) if context_blocks else "No specific files identified via query search."

        return {
            "assembled_context": assembled_context,
            "included_files": included_files,
            "total_chars": current_chars,
            "files_evaluated": len(candidate_paths),
        }
