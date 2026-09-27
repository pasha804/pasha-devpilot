import pytest
from src.billing_service import BillingService, InsufficientCreditsError

@pytest.fixture
def billing_service():
    return BillingService()

def test_account_registration_and_credits(billing_service):
    """Account should start with 0 credits and support top up and deduction."""
    acc = billing_service.register_account("acc_001", "usr_9981", tier="pro")
    assert acc.credit_balance == 0.0

    billing_service.top_up_credits("acc_001", 100.0)
    assert acc.credit_balance == 100.0

    remaining = billing_service.deduct_credits("acc_001", 35.0)
    assert remaining == 65.0
    assert acc.credit_balance == 65.0

def test_insufficient_credits_raises_error(billing_service):
    """Attempting to deduct more credits than available must raise an exception."""
    billing_service.register_account("acc_002", "usr_1234", tier="starter")
    billing_service.top_up_credits("acc_002", 20.0)

    with pytest.raises(InsufficientCreditsError):
        billing_service.deduct_credits("acc_002", 50.0)

def test_calculate_invoice_with_promotional_discount(billing_service):
    """
    Subtotal $100 with a 20% discount should yield $80 subtotal.
    With 10% tax, the final total must be $88.00.
    """
    subtotal = 100.0
    discount_percent = 20.0
    tax_rate = 0.10

    total = billing_service.calculate_invoice_total(subtotal, discount_percent, tax_rate)
    
    # Expected: (100 - 20) * 1.10 = 88.00
    assert total == 88.00, f"Expected total $88.00 after 20% discount, but got ${total}"

def test_refund_credits(billing_service):
    """Refunding credits must increase the account credit balance."""
    billing_service.register_account("acc_003", "usr_9981", tier="starter")
    billing_service.top_up_credits("acc_003", 50.0)
    new_balance = billing_service.refund_credits("acc_003", 25.0)
    assert new_balance == 75.0, f"Expected 75.0 credits after refund, but got {new_balance}"

