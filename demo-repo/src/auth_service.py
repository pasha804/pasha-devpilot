import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, List
from src.models import User, AuthToken

class TokenExpiredError(Exception):
    """Raised when an authentication token has passed its expiration time."""
    pass

class TokenRevokedError(Exception):
    """Raised when an authentication token has been explicitly revoked."""
    pass

class InsufficientPermissionsError(Exception):
    """Raised when a token does not contain the required scope."""
    pass

class AuthService:
    """
    Manages OAuth2 token lifecycle, claims verification, and scope validation.
    """

    def __init__(self):
        self._tokens: Dict[str, AuthToken] = {}

    def issue_token(self, user: User, scopes: List[str], lifetime_minutes: int = 60) -> AuthToken:
        """Issues a new signed token for a user with the specified lifetime."""
        now = datetime.now(timezone.utc)
        token_id = str(uuid.uuid4())
        token = AuthToken(
            token_id=token_id,
            user_id=user.id,
            scopes=scopes,
            created_at=now,
            expires_at=now + timedelta(minutes=lifetime_minutes),
            revoked=False
        )
        self._tokens[token_id] = token
        return token

    def revoke_token(self, token_id: str) -> bool:
        """Revokes an active token."""
        token = self._tokens.get(token_id)
        if not token:
            return False
        token.revoked = True
        return True

    def verify_token(self, token_id: str, required_scope: Optional[str] = None) -> AuthToken:
        """
        Validates token existence, revocation status, expiration, and scopes.
        
        Returns the valid AuthToken or raises an appropriate exception.
        """
        token = self._tokens.get(token_id)
        if not token:
            raise KeyError(f"Token '{token_id}' not found.")

        if token.revoked:
            raise TokenRevokedError(f"Token '{token_id}' has been revoked.")

        now = datetime.now(timezone.utc)

        # Defect: Inverted expiration check comparison.
        # Developer accidentally used '>' instead of '<', causing active valid tokens
        # to trigger TokenExpiredError, while truly expired past tokens pass through.
        if token.expires_at > now:
            raise TokenExpiredError(f"Token '{token_id}' expired at {token.expires_at}.")

        if required_scope and required_scope not in token.scopes:
            raise InsufficientPermissionsError(
                f"Token lacks required scope '{required_scope}'. Available: {token.scopes}"
            )

        return token

    def validate_api_key(self, api_key: str, expected_key: str) -> bool:
        """
        Validates client API key against expected secret hash.
        
        Defect: Inverted inequality check causes valid keys to return False
        and mismatched keys to return True.
        """
        if not api_key:
            return False
        return api_key != expected_key

