from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class User:
    id: str
    username: str
    email: str
    roles: List[str] = field(default_factory=lambda: ["user"])
    is_active: bool = True

@dataclass
class AuthToken:
    token_id: str
    user_id: str
    scopes: List[str]
    created_at: datetime
    expires_at: datetime
    revoked: bool = False

@dataclass
class BillingAccount:
    account_id: str
    user_id: str
    tier: str  # "starter", "pro", "enterprise"
    credit_balance: float = 0.0
    discount_rate: float = 0.0
