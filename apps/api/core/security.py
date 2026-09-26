"""
Pasha DevPilot — Security & Token Service
Provides JWT session token signing, verification, and secret filtering.
"""

import os
import re
import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from .config import settings



# Patterns for detecting credentials and API keys in files
SECRET_PATTERNS = [
    re.compile(r"(?i)(?:api[_-]?key|secret|token|password|auth[_-]?token)\s*[:=]\s*['\"]([a-zA-Z0-9_\-\.]{12,})['\"]"),
    re.compile(r"gh[pous]_[A-Za-z0-9_]{36,255}"),  # GitHub tokens
    re.compile(r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"),
    re.compile(r"AIza[0-9A-Za-z-_]{35}"),  # Google API keys
    re.compile(r"sk-[a-zA-Z0-9]{32,}"),  # OpenAI keys
]


def mask_secret(value: str) -> str:
    """Masks secret value preserving first 4 and last 4 characters."""
    if not value or len(value) < 8:
        return "********"
    return f"{value[:4]}...{value[-4:]}"


def contains_secret(content: str) -> bool:
    """Returns True if the content matches any known secret/token patterns."""
    for pattern in SECRET_PATTERNS:
        if pattern.search(content):
            return True
    return False


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True},
        )
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_oauth_state() -> str:
    """Generates a tamper-proof timestamped CSRF state parameter for OAuth flows."""
    timestamp = int(datetime.now(timezone.utc).timestamp())
    nonce = os.urandom(8).hex()
    msg = f"{timestamp}:{nonce}"
    secret = (settings.SECRET_KEY or "devpilot-default-secret-key").encode()
    sig = hmac.new(secret, msg.encode(), hashlib.sha256).hexdigest()[:32]
    return f"{msg}:{sig}"


def verify_oauth_state(state: str, max_age_seconds: int = 900) -> bool:
    """Verifies that an OAuth state parameter is authentic and within max_age_seconds (default 15 mins)."""
    if not state or not isinstance(state, str):
        return False
    try:
        parts = state.split(":")
        if len(parts) != 3:
            return False
        timestamp, nonce, sig = int(parts[0]), parts[1], parts[2]
        now = int(datetime.now(timezone.utc).timestamp())
        # Check window: not expired and not in future (> 60s clock skew)
        if (now - timestamp) > max_age_seconds or timestamp > (now + 60):
            return False
        msg = f"{timestamp}:{nonce}"
        secret = (settings.SECRET_KEY or "devpilot-default-secret-key").encode()
        expected_sig = hmac.new(secret, msg.encode(), hashlib.sha256).hexdigest()[:32]
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False

