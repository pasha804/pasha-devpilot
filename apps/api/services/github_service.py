"""
Pasha DevPilot — GitHub Service Layer
Handles real GitHub OAuth token exchange, repository retrieval (public & private),
cloning repositories, branch creation, and pull request operations.

Both paths are supported:
  1. OAuth 2.0 flow  — code exchanged for token via /auth/github/callback
  2. PAT login       — Personal Access Token validated directly via /auth/github/token
"""

from typing import Dict, Any, List, Optional
import os
import httpx
import asyncio
from pathlib import Path
from fastapi import HTTPException
from ..core.config import settings


class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.base_url = "https://api.github.com"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": settings.GITHUB_APP_NAME,
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    # -------------------------------------------------------------------------
    # OAuth token exchange
    # -------------------------------------------------------------------------

    async def exchange_code_for_token(self, code: str) -> str:
        """
        Exchanges a GitHub OAuth temporary code for a real access token.

        Raises HTTPException 503 if OAuth credentials are not configured.
        Raises HTTPException 400 if GitHub rejects the code.
        """
        if not settings.GITHUB_CLIENT_ID or settings.GITHUB_CLIENT_ID == "mock_client_id":
            raise HTTPException(
                status_code=503,
                detail=(
                    "GitHub OAuth is not configured. "
                    "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file. "
                    "Create a free GitHub OAuth App at https://github.com/settings/developers"
                ),
            )

        url = "https://github.com/login/oauth/access_token"
        payload = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
        }
        headers = {"Accept": "application/json"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"GitHub OAuth token exchange failed (HTTP {resp.status_code})",
            )

        data = resp.json()
        token = data.get("access_token")
        if not token:
            error = data.get("error_description") or data.get("error") or "Unknown error"
            raise HTTPException(
                status_code=400,
                detail=f"GitHub OAuth token exchange failed: {error}",
            )
        return token

    # -------------------------------------------------------------------------
    # User profile
    # -------------------------------------------------------------------------

    async def get_user_profile(self) -> Dict[str, Any]:
        """
        Fetches the profile of the authenticated GitHub user using the stored token.

        Raises HTTPException 401 if no token is present or GitHub rejects it.
        """
        if not self.token:
            raise HTTPException(
                status_code=401,
                detail="No GitHub token provided. Authenticate via OAuth or PAT first.",
            )

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.base_url}/user",
                headers=self._get_headers(),
            )

        if resp.status_code == 401:
            raise HTTPException(
                status_code=401,
                detail="GitHub token is invalid or expired. Please re-authenticate.",
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch GitHub profile (HTTP {resp.status_code})",
            )

        return resp.json()

    # -------------------------------------------------------------------------
    # Repository listing
    # -------------------------------------------------------------------------

    async def list_authenticated_repositories(self) -> List[Dict[str, Any]]:
        """
        Lists ALL repositories accessible to the authenticated user:
        owned repos, repos the user collaborates on, and org repos.
        Requires a valid OAuth or PAT token with `repo` scope.
        """
        repos: List[Dict[str, Any]] = []
        page = 1
        while True:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(
                    f"{self.base_url}/user/repos",
                    params={
                        "sort": "updated",
                        "per_page": 100,
                        "page": page,
                        "affiliation": "owner,collaborator,organization_member",
                    },
                    headers=self._get_headers(),
                )
            if resp.status_code != 200:
                break
            batch = resp.json()
            if not batch:
                break
            repos.extend(batch)
            # GitHub paginates; stop when we get less than 100
            if len(batch) < 100:
                break
            page += 1

        return [self._normalize_repo(r) for r in repos]

    async def list_user_public_repositories(self, username: str) -> List[Dict[str, Any]]:
        """
        Fetches public repositories for any GitHub username without authentication.
        Used as a fallback when no token is available.
        """
        repos: List[Dict[str, Any]] = []
        try:
            headers = {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": settings.GITHUB_APP_NAME,
            }
            # Add token if available to increase rate limit
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    f"{self.base_url}/users/{username}/repos",
                    params={"sort": "updated", "per_page": 100},
                    headers=headers,
                )
            if resp.status_code == 200:
                repos = [self._normalize_repo(r) for r in resp.json()]
        except Exception:
            pass
        return repos

    async def list_repositories(self, username: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Main repository listing method.

        Strategy:
          1. If a real token is present, fetch ALL repos the user has access to
             (public + private, owned + collaborated + org member).
          2. If no token but a username is given, fetch that user's public repos.
          3. In EXECUTION_MODE=mock with no repos found, inject the built-in
             demo-repo so the platform is always demonstrable.
        """
        repos: List[Dict[str, Any]] = []

        if self.token:
            # Path 1: Authenticated — full repo access (OAuth or PAT)
            repos = await self.list_authenticated_repositories()

        if not repos and username:
            # Path 2: No token but username known — public repos only
            repos = await self.list_user_public_repositories(username)

        if not repos and settings.EXECUTION_MODE == "mock":
            # Path 3: Mock mode only — inject the built-in sandbox demo repo
            repos = [self._demo_repo_entry(username or "demo")]

        return repos

    def _normalize_repo(self, r: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes a raw GitHub API repo object into the DevPilot schema."""
        owner_login = r.get("owner", {}).get("login", "unknown")
        return {
            "id": r.get("id"),
            "name": r.get("name"),
            "full_name": r.get("full_name"),
            "owner": {
                "login": owner_login,
                "avatar_url": r.get("owner", {}).get("avatar_url", ""),
            },
            "default_branch": r.get("default_branch", "main"),
            "private": r.get("private", False),
            "language": r.get("language") or "Code",
            "description": r.get("description") or "GitHub repository",
            "html_url": r.get("html_url"),
            "clone_url": r.get("clone_url") or "",
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "local_path": f"repos/{owner_login}_{r.get('name')}",
            "updated_at": r.get("updated_at"),
        }

    def _demo_repo_entry(self, username: str) -> Dict[str, Any]:
        """Returns the built-in sandbox demo repo entry (mock mode only)."""
        return {
            "id": 99901,
            "name": "devpilot-demo-service",
            "full_name": f"{username}/devpilot-demo-service",
            "owner": {
                "login": username,
                "avatar_url": f"https://github.com/{username}.png",
            },
            "default_branch": "main",
            "private": False,
            "language": "Python",
            "description": "FastAPI Authentication Microservice — built-in sandbox with seeded bug & pytest suite",
            "html_url": None,
            "clone_url": "",
            "stargazers_count": 0,
            "forks_count": 0,
            "local_path": "demo-repo",
            "updated_at": None,
        }

    # -------------------------------------------------------------------------
    # Clone
    # -------------------------------------------------------------------------

    async def clone_repository(self, clone_url: str, target_path: str) -> Dict[str, Any]:
        """
        Clones a remote repository to target_path using git.
        Embeds the OAuth/PAT token in the URL for private repos.
        """
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        p = Path(target_path)
        if not p.is_absolute():
            p = (project_root / target_path).resolve()

        if p.exists() and (p / ".git").exists():
            return {"status": "exists", "path": str(p)}

        p.parent.mkdir(parents=True, exist_ok=True)

        auth_url = clone_url
        if self.token and clone_url and "github.com" in clone_url:
            auth_url = clone_url.replace("https://", f"https://x-access-token:{self.token}@")

        git_env = os.environ.copy()
        git_env["GIT_TERMINAL_PROMPT"] = "0"

        proc = await asyncio.create_subprocess_exec(
            "git", "clone", "--depth", "1", auth_url, str(p),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=git_env,
        )
        stdout, stderr = await proc.communicate()
        return {
            "status": "cloned" if proc.returncode == 0 else "error",
            "path": str(p),
            "output": stderr.decode("utf-8", errors="replace"),
        }

    # -------------------------------------------------------------------------
    # Pull Request
    # -------------------------------------------------------------------------

    async def create_pull_request(
        self,
        owner: str,
        repo: str,
        title: str,
        body: str,
        head: str,
        base: str = "main",
    ) -> Dict[str, Any]:
        """
        Creates a Pull Request on GitHub.
        If no real token is available, returns a local-branch-prepared status
        (no fake PR URL is ever generated).
        """
        if not self.token:
            return {
                "id": None,
                "number": None,
                "title": title,
                "body": body,
                "html_url": None,
                "state": "LOCAL_BRANCH_PREPARED",
                "head": {"ref": head},
                "base": {"ref": base},
                "status_message": (
                    f"Local git branch '{head}' created and committed. "
                    "Pushing to remote requires active GitHub OAuth or PAT to open a real PR."
                ),
            }

        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
        payload = {"title": title, "body": body, "head": head, "base": base}

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=self._get_headers(), json=payload)
            resp.raise_for_status()
            return resp.json()
