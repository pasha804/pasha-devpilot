"""
Pasha DevPilot — Auth Schemas
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class GitHubAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None


class GitHubTokenLoginRequest(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    username: str
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    workspace_id: str
    workspace_name: str
