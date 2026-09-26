"""
Pasha DevPilot — Repository Indexer Service
Indexes repository files, detects languages/frameworks, parses code symbols,
and excludes secret and sensitive files.
"""

import os
import re
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..models.repository import Repository, RepositoryFile, RepositorySymbol
from ..core.security import contains_secret


IGNORE_DIRECTORIES = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "env",
    "__pycache__",
    "dist",
    "build",
    ".next",
    ".nuxt",
    ".output",
    "coverage",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".turbo",
    ".cache",
}

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg",
    ".pdf", ".zip", ".tar", ".gz", ".exe", ".dll",
    ".so", ".dylib", ".bin", ".woff", ".woff2", ".ttf",
    ".db", ".sqlite", ".sqlite3",
}

SENSITIVE_FILENAME_PATTERNS = [
    re.compile(r"^\.env(\..+)?$", re.IGNORECASE),
    re.compile(r".*\.(pem|key|pkcs12|p12|crt|cert)$", re.IGNORECASE),
    re.compile(r".*(id_rsa|id_ed25519|credentials\.json)$", re.IGNORECASE),
]

EXT_TO_LANGUAGE = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".cs": "C#",
    ".rb": "Ruby",
    ".php": "PHP",
    ".html": "HTML",
    ".css": "CSS",
    ".sql": "SQL",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
    ".sh": "Shell",
}


class RepositoryIndexer:
    def __init__(self, repo_path: str):
        self.repo_root = Path(repo_path).resolve()

    def is_sensitive_file(self, filename: str, content: str = "") -> bool:
        for p in SENSITIVE_FILENAME_PATTERNS:
            if p.match(filename):
                return True
        if content and contains_secret(content):
            return True
        return False

    def detect_frameworks(self) -> List[str]:
        frameworks = []
        # Python
        if (self.repo_root / "pyproject.toml").exists() or (self.repo_root / "requirements.txt").exists():
            content = ""
            for cfg in ["pyproject.toml", "requirements.txt"]:
                p = self.repo_root / cfg
                if p.exists():
                    content += p.read_text(encoding="utf-8", errors="ignore").lower()
            if "fastapi" in content:
                frameworks.append("FastAPI")
            if "flask" in content:
                frameworks.append("Flask")
            if "django" in content:
                frameworks.append("Django")
            if "sqlalchemy" in content:
                frameworks.append("SQLAlchemy")

        # JS / TS
        pkg_json = self.repo_root / "package.json"
        if pkg_json.exists():
            try:
                pkg_data = json.loads(pkg_json.read_text(encoding="utf-8", errors="ignore"))
                deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
                if "next" in deps:
                    frameworks.append("Next.js")
                if "react" in deps:
                    frameworks.append("React")
                if "express" in deps:
                    frameworks.append("Express")
                if "tailwindcss" in deps:
                    frameworks.append("TailwindCSS")
            except Exception:
                pass

        return list(set(frameworks))

    def detect_test_runners(self) -> List[str]:
        runners = []
        if (self.repo_root / "pytest.ini").exists() or (self.repo_root / "pyproject.toml").exists() or any(self.repo_root.glob("test_*.py")):
            runners.append("pytest")

        pkg_json = self.repo_root / "package.json"
        if pkg_json.exists():
            try:
                pkg_data = json.loads(pkg_json.read_text(encoding="utf-8", errors="ignore"))
                scripts = pkg_data.get("scripts", {})
                deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
                if "test" in scripts:
                    runners.append("npm test")
                if "vitest" in deps:
                    runners.append("vitest")
                if "jest" in deps:
                    runners.append("jest")
            except Exception:
                pass

        return list(set(runners))

    def extract_symbols(self, file_path_rel: str, content: str) -> List[Dict[str, Any]]:
        symbols = []
        py_func = re.compile(r"^\s*def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)", re.MULTILINE)
        py_class = re.compile(r"^\s*class\s+([a-zA-Z0-9_]+)(?:\((.*?)\))?:", re.MULTILINE)
        js_func = re.compile(r"^\s*(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(", re.MULTILINE)
        js_class = re.compile(r"^\s*(?:export\s+)?class\s+([a-zA-Z0-9_]+)", re.MULTILINE)

        for line_num, line in enumerate(content.splitlines(), start=1):
            m = py_func.match(line)
            if m:
                symbols.append({"name": m.group(1), "type": "function", "line": line_num, "sig": line.strip()})
                continue
            m = py_class.match(line)
            if m:
                symbols.append({"name": m.group(1), "type": "class", "line": line_num, "sig": line.strip()})
                continue
            m = js_func.match(line)
            if m:
                symbols.append({"name": m.group(1), "type": "function", "line": line_num, "sig": line.strip()})
                continue
            m = js_class.match(line)
            if m:
                symbols.append({"name": m.group(1), "type": "class", "line": line_num, "sig": line.strip()})
                continue

        return symbols

    async def index_repository(self, db: AsyncSession, repo_id: str) -> Dict[str, Any]:
        """Performs full indexing of the repository into the database."""
        # Clear existing file and symbol records for clean re-index
        await db.execute(delete(RepositoryFile).where(RepositoryFile.repository_id == repo_id))
        await db.execute(delete(RepositorySymbol).where(RepositorySymbol.repository_id == repo_id))

        total_files = 0
        total_symbols = 0
        sensitive_files_count = 0
        primary_lang_counts: Dict[str, int] = {}

        for root, dirs, files in os.walk(self.repo_root):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRECTORIES and not d.startswith(".")]
            rel_dir = Path(root).relative_to(self.repo_root)

            for f in files:
                file_path = Path(root) / f
                rel_path = (rel_dir / f).as_posix()
                ext = file_path.suffix.lower()

                if ext in BINARY_EXTENSIONS:
                    continue

                # Read content safely
                try:
                    raw_bytes = file_path.read_bytes()
                    content = raw_bytes.decode("utf-8", errors="ignore")
                    sha = hashlib.sha256(raw_bytes).hexdigest()
                    line_count = len(content.splitlines())
                except Exception:
                    continue

                is_sens = self.is_sensitive_file(f, content)
                if is_sens:
                    sensitive_files_count += 1

                lang = EXT_TO_LANGUAGE.get(ext, "Unknown")
                if lang != "Unknown":
                    primary_lang_counts[lang] = primary_lang_counts.get(lang, 0) + 1

                # Save file record
                stat = file_path.stat()
                repo_file = RepositoryFile(
                    repository_id=repo_id,
                    path=rel_path,
                    extension=ext,
                    size_bytes=stat.st_size,
                    line_count=line_count,
                    language=lang,
                    is_sensitive=is_sens,
                    sha256=sha,
                    last_modified=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc),
                )
                db.add(repo_file)
                total_files += 1

                # Extract and save symbols if not sensitive
                if not is_sens and ext in (".py", ".ts", ".tsx", ".js", ".jsx"):
                    extracted = self.extract_symbols(rel_path, content)
                    for s in extracted:
                        repo_sym = RepositorySymbol(
                            repository_id=repo_id,
                            file_path=rel_path,
                            symbol_name=s["name"],
                            symbol_type=s["type"],
                            line_number=s["line"],
                            signature=s["sig"],
                        )
                        db.add(repo_sym)
                        total_symbols += 1

        # Determine primary language
        primary_lang = max(primary_lang_counts, key=primary_lang_counts.get) if primary_lang_counts else "Unknown"
        detected_frameworks = self.detect_frameworks()
        detected_runners = self.detect_test_runners()

        # Update repository record
        q = await db.execute(select(Repository).where(Repository.id == repo_id))
        repo = q.scalars().first()
        if repo:
            repo.primary_language = primary_lang
            repo.detected_frameworks = json.dumps(detected_frameworks)
            repo.detected_test_runners = json.dumps(detected_runners)
            repo.indexed_at = datetime.now(timezone.utc)

        await db.commit()

        return {
            "indexed": True,
            "total_files": total_files,
            "total_symbols": total_symbols,
            "sensitive_files_excluded": sensitive_files_count,
            "primary_language": primary_lang,
            "detected_frameworks": detected_frameworks,
            "detected_test_runners": detected_runners,
        }
