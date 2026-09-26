"""
Demo Repository — Authentication Service
Contains authentication and token verification logic.
"""

from typing import Optional, Dict
from .models import User, AuthToken


class AuthService:
    def __init__(self):
        self._tokens: Dict[str, AuthToken] = {}
        self._users: Dict[str, User] = {}

    def register_user(self, user: User) -> None:
        self._users[user.id] = user

    def issue_token(self, user_id: str, current_timestamp: float) -> AuthToken:
        token_str = f"tok_{user_id}_{int(current_timestamp)}"
        tok = AuthToken(
            token=token_str,
            user_id=user_id,
            created_at_timestamp=current_timestamp,
            expires_in_seconds=3600,
        )
        self._tokens[token_str] = tok
        return tok

    def is_token_expired(self, token: AuthToken, current_timestamp: float) -> bool:
        """
        Check if a token has exceeded its expiration window.
        
        SEEDED BUG: Inverted operator causes valid fresh tokens to be flagged
        as expired immediately!
        """
        # BUG: '<' should be '>'
        return current_timestamp < (token.created_at_timestamp + token.expires_in_seconds)

    def validate_token(self, token_str: str, current_timestamp: float) -> Optional[User]:
        token = self._tokens.get(token_str)
        if not token:
            return None
        if self.is_token_expired(token, current_timestamp):
            return None
        return self._users.get(token.user_id)
