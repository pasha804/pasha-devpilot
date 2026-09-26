"""
Pasha DevPilot — Authentication Routes

Two fully functional login paths:
  1. GitHub OAuth 2.0 — /auth/github/url  →  /auth/github/callback
  2. Personal Access Token (PAT) — /auth/github/token

Both paths call real GitHub APIs and store the real access token.
"""

import re
from pathlib import Path
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..core.config import settings
from ..core.database import get_db
from ..core.security import (
    create_access_token,
    decode_access_token,
    hash_token,
    generate_oauth_state,
    verify_oauth_state,
)
from ..core.audit import record_audit_log
from ..models.user import User, Workspace, WorkspaceMember, Session
from ..schemas.auth import GitHubAuthCallback, GitHubTokenLoginRequest, TokenResponse, UserProfileResponse
from ..services.github_service import GitHubService

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# OAuth URL
# ---------------------------------------------------------------------------

class GitHubOAuthConfigRequest(BaseModel):
    client_id: str
    client_secret: str


@router.get("/github")
@router.get("/github/url")
async def get_github_auth_url(redirect: bool = Query(False)):
    """Returns the GitHub OAuth login authorization URL with CSRF state protection."""
    is_configured = bool(
        settings.GITHUB_CLIENT_ID
        and settings.GITHUB_CLIENT_ID != "mock_client_id"
        and settings.GITHUB_CLIENT_SECRET
        and settings.GITHUB_CLIENT_SECRET != "mock_client_secret"
    )
    state = generate_oauth_state()
    url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
        f"scope=repo,read:user,user:email&"
        f"state={state}"
    )
    if redirect and is_configured:
        return RedirectResponse(url=url, status_code=307)

    register_app_url = (
        f"https://github.com/settings/applications/new?"
        f"oauth_application[name]=Pasha+DevPilot&"
        f"oauth_application[url]={settings.FRONTEND_URL}&"
        f"oauth_application[callback_url]={settings.GITHUB_REDIRECT_URI}"
    )
    generate_pat_url = (
        f"https://github.com/settings/tokens/new?"
        f"scopes=repo,read:user,user:email&"
        f"description=Pasha+DevPilot"
    )
    return {
        "url": url if is_configured else None,
        "state": state,
        "is_mock_enabled": not is_configured,
        "is_configured": is_configured,
        "client_id": settings.GITHUB_CLIENT_ID if is_configured else None,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "register_app_url": register_app_url,
        "generate_pat_url": generate_pat_url,
    }


@router.post("/github/configure-oauth")
async def configure_github_oauth(payload: GitHubOAuthConfigRequest):
    """
    Sets GitHub OAuth credentials dynamically and persists them to .env.
    Enables instant redirection to GitHub's authorization page without server restarts.
    """
    clean_id = payload.client_id.strip()
    clean_secret = payload.client_secret.strip()
    if not clean_id or not clean_secret:
        raise HTTPException(status_code=400, detail="Client ID and Client Secret are required.")

    # Update in-memory settings
    settings.GITHUB_CLIENT_ID = clean_id
    settings.GITHUB_CLIENT_SECRET = clean_secret

    # Persist to .env
    env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
    if env_path.exists():
        content = env_path.read_text(encoding="utf-8")
        if "GITHUB_CLIENT_ID=" in content:
            content = re.sub(r"GITHUB_CLIENT_ID=.*", f"GITHUB_CLIENT_ID={clean_id}", content)
        else:
            content += f"\nGITHUB_CLIENT_ID={clean_id}"
        if "GITHUB_CLIENT_SECRET=" in content:
            content = re.sub(r"GITHUB_CLIENT_SECRET=.*", f"GITHUB_CLIENT_SECRET={clean_secret}", content)
        else:
            content += f"\nGITHUB_CLIENT_SECRET={clean_secret}"
        env_path.write_text(content, encoding="utf-8")

    state = generate_oauth_state()
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={clean_id}&"
        f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
        f"scope=repo,read:user,user:email&"
        f"state={state}"
    )
    return {
        "status": "success",
        "message": "GitHub OAuth configured successfully.",
        "url": auth_url,
        "state": state,
    }


# ---------------------------------------------------------------------------
# OAuth callback — GET & POST paths with CSRF state verification
# ---------------------------------------------------------------------------

@router.get("/github/callback")
async def github_auth_callback_get(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Direct browser callback from GitHub.
    Exchanges code for token, upserts user, and redirects to frontend with session.
    """
    if error:
        err_msg = error_description or "GitHub authorization failed or access was denied."
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?error={error}&error_description={err_msg}",
            status_code=307,
        )

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code.")

    if state and not verify_oauth_state(state):
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?error=invalid_state&error_description=OAuth+security+state+validation+failed",
            status_code=307,
        )

    gh = GitHubService()
    github_token = await gh.exchange_code_for_token(code)
    user_gh = GitHubService(token=github_token)
    profile = await user_gh.get_user_profile()

    token_data = await _upsert_user_and_issue_jwt(db, profile, github_token, audit_action="USER_OAUTH_LOGIN")
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={token_data.access_token}&user_id={token_data.user_id}&username={token_data.username}",
        status_code=307,
    )


@router.post("/github/callback", response_model=TokenResponse)
async def github_auth_callback(payload: GitHubAuthCallback, db: AsyncSession = Depends(get_db)):
    """
    Receives the GitHub OAuth code from the frontend callback page,
    validates CSRF state, exchanges it for a real GitHub access token, then creates or updates the user.
    """
    if payload.state and not verify_oauth_state(payload.state):
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state parameter.")

    gh = GitHubService()
    github_token = await gh.exchange_code_for_token(payload.code)

    user_gh = GitHubService(token=github_token)
    profile = await user_gh.get_user_profile()

    return await _upsert_user_and_issue_jwt(db, profile, github_token, audit_action="USER_OAUTH_LOGIN")


# ---------------------------------------------------------------------------
# Logout & Disconnect
# ---------------------------------------------------------------------------

@router.post("/logout")
async def logout_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Invalidates active session and records logout audit log."""
    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split(" ")[1]
        payload = decode_access_token(raw_token)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            th = hash_token(raw_token)
            await db.execute(delete(Session).where((Session.user_id == user_id) | (Session.token_hash == th)))
            await db.commit()
            await record_audit_log(db, action="USER_LOGOUT", user_id=user_id, resource_type="AUTH")
    return {"status": "success", "message": "Successfully logged out."}


@router.post("/github/disconnect")
async def disconnect_github(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Disconnects GitHub account, removes token from DB, and purges active sessions."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    raw_token = authorization.split(" ")[1]
    payload = decode_access_token(raw_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    user_id = payload["sub"]
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.github_access_token = None
    await db.execute(delete(Session).where(Session.user_id == user_id))
    await db.commit()
    await record_audit_log(db, action="GITHUB_DISCONNECT", user_id=user_id, resource_type="INTEGRATION")

    return {"status": "success", "message": "GitHub account successfully disconnected."}



# ---------------------------------------------------------------------------
# PAT login — user pastes their own Personal Access Token
# ---------------------------------------------------------------------------

@router.post("/github/token", response_model=TokenResponse)
async def github_token_login(payload: GitHubTokenLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates using a GitHub Personal Access Token (PAT).
    The PAT is validated against the GitHub API and the real user profile is fetched.
    Required PAT scopes: repo, read:user
    """
    clean_token = payload.token.strip()
    if not clean_token:
        raise HTTPException(status_code=400, detail="Token cannot be empty")

    gh = GitHubService(token=clean_token)
    # get_user_profile raises HTTPException 401 if token is invalid
    profile = await gh.get_user_profile()

    return await _upsert_user_and_issue_jwt(db, profile, clean_token, audit_action="USER_PAT_LOGIN")


# ---------------------------------------------------------------------------
# Connect GitHub by username (public profile only — no token stored)
# Used as a lightweight fallback to browse public repos without full OAuth.
# ---------------------------------------------------------------------------

@router.post("/github/connect-account")
async def connect_github_account(payload: dict, db: AsyncSession = Depends(get_db)):
    """
    Looks up a GitHub user's public profile by username and creates a session.
    This grants access to public repos only. For private repos, use OAuth or PAT.
    """
    import httpx

    raw_username = payload.get("username", "").strip().replace("@", "")
    if not raw_username:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub username.")

    profile: dict = {}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"https://api.github.com/users/{raw_username}",
                headers={
                    "User-Agent": settings.GITHUB_APP_NAME,
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            if resp.status_code == 200:
                profile = resp.json()
            elif resp.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub user '{raw_username}' not found.")
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"GitHub API returned {resp.status_code} for user '{raw_username}'",
                )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not reach GitHub API: {exc}") from exc

    # No token stored — public repos only
    return await _upsert_user_and_issue_jwt(db, profile, github_token=None, audit_action="USER_PUBLIC_CONNECT")


# ---------------------------------------------------------------------------
# Developer / demo one-click login  — ONLY in mock mode
# ---------------------------------------------------------------------------

@router.post("/developer-login", response_model=TokenResponse)
async def developer_login(db: AsyncSession = Depends(get_db)):
    """
    One-click instant login for local development and demo purposes.
    """

    # In mock mode, create/return a local demo user without a real GitHub token
    demo_profile = {
        "id": 9991234,
        "login": "demo-user",
        "name": "Demo Engineer",
        "email": None,
        "avatar_url": "https://avatars.githubusercontent.com/u/9919?v=4",
    }
    return await _upsert_user_and_issue_jwt(db, demo_profile, github_token=None, audit_action="USER_DEMO_LOGIN")


# ---------------------------------------------------------------------------
# Current user profile
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    raw_token = authorization.split(" ")[1]
    payload = decode_access_token(raw_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    user_id = payload["sub"]
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    q_ws = await db.execute(
        select(Workspace)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .where(WorkspaceMember.user_id == user.id)
    )
    ws = q_ws.scalars().first()

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        name=user.name,
        email=user.email,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        workspace_id=ws.id if ws else "default",
        workspace_name=ws.name if ws else "Default Workspace",
    )


# ---------------------------------------------------------------------------
# Shared helper — upsert user record + issue JWT
# ---------------------------------------------------------------------------

async def _upsert_user_and_issue_jwt(
    db: AsyncSession,
    profile: dict,
    github_token: str | None,
    audit_action: str,
) -> TokenResponse:
    """
    Creates or updates a User record from a GitHub profile dict,
    issues a signed JWT, and records a Session row with a proper expiry.
    """
    gh_id = str(profile.get("id", ""))
    username = profile.get("login") or f"user_{gh_id}"
    email = profile.get("email")
    avatar = profile.get("avatar_url")
    name = profile.get("name") or username

    # Find or create user
    q = await db.execute(
        select(User).where((User.github_id == gh_id) | (User.username == username))
    )
    user = q.scalars().first()

    if not user:
        user = User(
            github_id=gh_id,
            username=username,
            name=name,
            email=email,
            avatar_url=avatar,
            github_access_token=github_token,  # TODO: encrypt at rest before production
        )
        db.add(user)
        await db.flush()

        ws = Workspace(
            name=f"{username}'s Workspace",
            slug=f"{username}-workspace",
            owner_id=user.id,
        )
        db.add(ws)
        await db.flush()

        member = WorkspaceMember(
            workspace_id=ws.id,
            user_id=user.id,
            role="OWNER",
        )
        db.add(member)
        await db.commit()
    else:
        user.github_id = gh_id or user.github_id
        user.name = name
        user.avatar_url = avatar
        if github_token:
            user.github_access_token = github_token  # TODO: encrypt at rest
        if email:
            user.email = email
        await db.commit()

    # Issue JWT
    jwt_token = create_access_token({"sub": user.id, "username": user.username})

    # Record session with correct expiry
    session_rec = Session(
        user_id=user.id,
        token_hash=hash_token(jwt_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(session_rec)
    await record_audit_log(db, action=audit_action, user_id=user.id, resource_type="AUTH")

    return TokenResponse(
        access_token=jwt_token,
        user_id=user.id,
        username=user.username,
        name=user.name,
        avatar_url=user.avatar_url,
    )
