"""
Demo Repository — Domain Models
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    id: str
    username: str
    email: str
    is_active: bool = True
    role: str = "developer"


@dataclass
class AuthToken:
    token: str
    user_id: str
    created_at_timestamp: float
    expires_in_seconds: int = 3600
