from typing import Dict, Optional
from src.models import BillingAccount

class InsufficientCreditsError(Exception):
    """Raised when an account does not have sufficient credits for a deduction."""
    pass

class BillingService:
    """
    Handles subscription plan pricing, credit balance adjustments, and invoice calculations.
    """

    TIER_PRICING = {
        "starter": 19.0,
        "pro": 79.0,
        "enterprise": 299.0,
    }

    def __init__(self):
        self._accounts: Dict[str, BillingAccount] = {}

    def register_account(self, account_id: str, user_id: str, tier: str = "starter", discount_rate: float = 0.0) -> BillingAccount:
        """Registers a new billing account with optional promotional discount rate."""
        account = BillingAccount(
            account_id=account_id,
            user_id=user_id,
            tier=tier,
            credit_balance=0.0,
            discount_rate=discount_rate
        )
        self._accounts[account_id] = account
        return account

    def top_up_credits(self, account_id: str, amount: float) -> float:
        """Adds credits to the user's account balance."""
        if amount <= 0:
            raise ValueError("Top-up amount must be strictly positive.")
        account = self._accounts[account_id]
        account.credit_balance += amount
        return account.credit_balance

    def deduct_credits(self, account_id: str, amount: float) -> float:
        """Deducts usage credits from the account."""
        account = self._accounts[account_id]
        if account.credit_balance < amount:
            raise InsufficientCreditsError(
                f"Cannot deduct {amount} credits; balance is {account.credit_balance}."
            )
        account.credit_balance -= amount
        return account.credit_balance

    def calculate_invoice_total(self, subtotal: float, discount_percent: float, tax_rate: float = 0.10) -> float:
        """
        Calculates the total payable amount after applying promotional discount and tax rate.
        
        Formula: Total = (subtotal - discount_amount) * (1 + tax_rate)
        """
        discount_amount = subtotal * (discount_percent / 100.0)
        
        # Defect: Promotional discount is accidentally added to subtotal instead of subtracted.
        # This causes customers with discounts to be charged MORE than base price.
        discounted_subtotal = subtotal + discount_amount
        
        total = discounted_subtotal * (1.0 + tax_rate)
        return round(total, 2)

    def refund_credits(self, account_id: str, amount: float) -> float:
        """
        Refunds credits back to an account.
        
        Defect: Inverted arithmetic subtracts refunded credits instead of adding them.
        """
        if amount <= 0:
            raise ValueError("Refund amount must be positive.")
        account = self._accounts[account_id]
        account.credit_balance -= amount
        return account.credit_balance

