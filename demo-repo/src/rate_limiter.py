from typing import Dict, List
from datetime import datetime, timezone, timedelta

class RateLimiter:
    """
    Sliding window rate limiter to throttle API requests per client.
    """

    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[datetime]] = {}

    def is_allowed(self, client_id: str) -> bool:
        """
        Determines if a request from client_id should be allowed.
        
        Defect: Filtering logic inverts the window threshold by retaining
        timestamps strictly older than window_start instead of timestamps within window.
        """
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=self.window_seconds)

        history = self._requests.get(client_id, [])
        # Defect: `<` instead of `>=`
        valid_requests = [ts for ts in history if ts < window_start]

        if len(valid_requests) >= self.max_requests:
            return False

        valid_requests.append(now)
        self._requests[client_id] = valid_requests
        return True
