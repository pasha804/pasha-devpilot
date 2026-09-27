import pytest
from datetime import datetime, timezone, timedelta
from src.models import User, AuthToken
from src.auth_service import AuthService, TokenExpiredError, TokenRevokedError, InsufficientPermissionsError

@pytest.fixture
def auth_service():
    return AuthService()

@pytest.fixture
def sample_user():
    return User(id="usr_9981", username="alex_dev", email="alex@company.internal")

def test_issue_and_verify_valid_token(auth_service, sample_user):
    """A freshly issued token with 60 minutes lifetime should be valid and verified."""
    token = auth_service.issue_token(sample_user, scopes=["repo:read", "repo:write"], lifetime_minutes=60)
    
    # Verification should pass cleanly
    verified = auth_service.verify_token(token.token_id, required_scope="repo:read")
    assert verified.user_id == sample_user.id
    assert "repo:write" in verified.scopes

def test_revoked_token_raises_error(auth_service, sample_user):
    """Revoked token must raise TokenRevokedError."""
    token = auth_service.issue_token(sample_user, scopes=["admin"])
    auth_service.revoke_token(token.token_id)

    with pytest.raises(TokenRevokedError):
        auth_service.verify_token(token.token_id)

def test_expired_token_rejected(auth_service, sample_user):
    """A token issued in the past with expired timestamp must be rejected."""
    token = auth_service.issue_token(sample_user, scopes=["read"], lifetime_minutes=-15)

    with pytest.raises(TokenExpiredError):
        auth_service.verify_token(token.token_id)

def test_missing_scope_raises_error(auth_service, sample_user):
    """Requesting verification with an unauthorized scope must fail."""
    token = auth_service.issue_token(sample_user, scopes=["read:profile"])

    with pytest.raises(InsufficientPermissionsError):
        auth_service.verify_token(token.token_id, required_scope="admin:write")

def test_api_key_validation(auth_service):
    """API key validator should return True only when provided key matches expected."""
    assert auth_service.validate_api_key("sec_key_xyz", "sec_key_xyz") is True
    assert auth_service.validate_api_key("wrong_key", "sec_key_xyz") is False

