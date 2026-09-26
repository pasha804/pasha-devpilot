"""
Pasha DevPilot — Multi-Strategy Code Search Service
Supports:
1. Exact Text & Regex Search
2. Symbol AST Search (classes, functions, endpoints)
3. Semantic Intent Search (natural language queries)
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.repository import RepositorySymbol, RepositoryFile
from ..schemas.repository import SearchMatchItem


class CodeSearchService:
    def __init__(self, repo_path: str):
        self.repo_root = Path(repo_path).resolve()

    async def exact_search(
        self,
        query: str,
        limit: int = 40,
        file_ext: Optional[str] = None,
    ) -> List[SearchMatchItem]:
        results: List[SearchMatchItem] = []
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        ignored = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next"}

        for root, dirs, files in os.walk(self.repo_root):
            dirs[:] = [d for d in dirs if d not in ignored and not d.startswith(".")]
            for f in files:
                if f.startswith(".env") or f.endswith((".pem", ".key", ".cert", ".ico", ".png", ".jpg")):
                    continue
                if file_ext and not f.endswith(file_ext):
                    continue

                fpath = Path(root) / f
                rel_path = fpath.relative_to(self.repo_root).as_posix()
                try:
                    content = fpath.read_text(encoding="utf-8", errors="ignore")
                    for idx, line in enumerate(content.splitlines(), start=1):
                        if pattern.search(line):
                            results.append(
                                SearchMatchItem(
                                    file_path=rel_path,
                                    line_number=idx,
                                    line_content=line.strip()[:200],
                                    match_score=1.0,
                                )
                            )
                            if len(results) >= limit:
                                return results
                except Exception:
                    continue
        return results

    async def symbol_search(
        self,
        db: AsyncSession,
        repo_id: str,
        symbol_query: str,
        limit: int = 40,
    ) -> List[SearchMatchItem]:
        results: List[SearchMatchItem] = []
        # Query indexed symbols from DB
        stmt = (
            select(RepositorySymbol)
            .where(
                RepositorySymbol.repository_id == repo_id,
                RepositorySymbol.symbol_name.ilike(f"%{symbol_query}%"),
            )
            .limit(limit)
        )
        q = await db.execute(stmt)
        symbols = q.scalars().all()

        for s in symbols:
            results.append(
                SearchMatchItem(
                    file_path=s.file_path,
                    line_number=s.line_number,
                    line_content=s.signature or f"{s.symbol_type} {s.symbol_name}",
                    match_score=0.95,
                    symbol_name=s.symbol_name,
                )
            )
        return results

    async def semantic_intent_search(
        self,
        query: str,
        limit: int = 20,
    ) -> List[SearchMatchItem]:
        """
        Maps natural language developer intent (e.g., 'where is auth handled?',
        'database models', 'routing') to relevant files and entrypoints.
        """
        results: List[SearchMatchItem] = []
        q_tokens = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
        ignored = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next"}

        scored_matches = []

        for root, dirs, files in os.walk(self.repo_root):
            dirs[:] = [d for d in dirs if d not in ignored and not d.startswith(".")]
            for f in files:
                if f.startswith(".env") or f.endswith((".pem", ".key", ".cert", ".ico", ".png")):
                    continue
                fpath = Path(root) / f
                rel_path = fpath.relative_to(self.repo_root).as_posix().lower()

                # Calculate filename relevance
                score = 0.0
                for token in q_tokens:
                    if token in rel_path:
                        score += 3.0
                    # Semantic mappings
                    if token in ("auth", "login", "jwt", "token") and any(k in rel_path for k in ("auth", "security", "token", "session")):
                        score += 4.0
                    if token in ("db", "database", "model", "schema") and any(k in rel_path for k in ("model", "schema", "db", "repository")):
                        score += 4.0
                    if token in ("test", "spec", "verify") and "test" in rel_path:
                        score += 3.0
                    if token in ("api", "route", "endpoint") and any(k in rel_path for k in ("route", "api", "controller", "endpoint")):
                        score += 4.0

                if score > 0:
                    scored_matches.append((score, fpath, rel_path))

        scored_matches.sort(key=lambda x: x[0], reverse=True)

        for score, fpath, rel_path in scored_matches[:limit]:
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()
                first_line = lines[0] if lines else "Empty file"
                results.append(
                    SearchMatchItem(
                        file_path=fpath.relative_to(self.repo_root).as_posix(),
                        line_number=1,
                        line_content=first_line.strip()[:180],
                        match_score=min(1.0, score / 10.0),
                    )
                )
            except Exception:
                continue

        return results
