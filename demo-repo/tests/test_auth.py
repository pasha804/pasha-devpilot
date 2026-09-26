"""
Tests for AuthService
"""

import time
import pytest
from src.models import User
from src.auth_service import AuthService


def test_valid_fresh_token():
    auth = AuthService()
    user = User(id="usr_01", username="pasha", email="pasha@example.com")
    auth.register_user(user)

    now = 1000000.0
    token = auth.issue_token(user_id="usr_01", current_timestamp=now)

    # 10 seconds later, token MUST still be valid
    validated_user = auth.validate_token(token.token, current_timestamp=now + 10)
    assert validated_user is not None, "Freshly issued token within 3600s must be valid"
    assert validated_user.id == "usr_01"


def test_expired_token():
    auth = AuthService()
    user = User(id="usr_02", username="alex", email="alex@example.com")
    auth.register_user(user)

    now = 1000000.0
    token = auth.issue_token(user_id="usr_02", current_timestamp=now)

    # 4000 seconds later (beyond 3600s limit), token MUST be expired
    validated_user = auth.validate_token(token.token, current_timestamp=now + 4000)
    assert validated_user is None, "Token beyond 3600s expiration limit must be rejected"
