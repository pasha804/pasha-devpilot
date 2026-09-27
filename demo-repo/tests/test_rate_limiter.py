import pytest
from src.rate_limiter import RateLimiter

def test_rate_limiter_allows_requests_under_threshold():
    """Initial requests within max limit should be permitted."""
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    assert limiter.is_allowed("client_alpha") is True
    assert limiter.is_allowed("client_alpha") is True
    assert limiter.is_allowed("client_alpha") is True

def test_rate_limiter_throttles_excess_requests():
    """Requests exceeding max_requests in sliding window must be rejected."""
    limiter = RateLimiter(max_requests=2, window_seconds=60)
    assert limiter.is_allowed("client_beta") is True
    assert limiter.is_allowed("client_beta") is True
    # 3rd request should exceed threshold and return False
    assert limiter.is_allowed("client_beta") is False, "Expected 3rd request to be throttled"
