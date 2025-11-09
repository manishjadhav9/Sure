from dataclasses import dataclass, asdict
from typing import Optional, Literal
from datetime import datetime
import uuid


@dataclass
class ParsedRecord:
    id: str
    filename: str
    issuer: Literal['HDFC', 'ICICI', 'SBI', 'AXIS', 'AMEX', 'UNKNOWN']
    card_last4: Optional[str]
    card_variant: Optional[str]
    total_balance: Optional[float]
    transaction_count: Optional[int]
    interest_charges: Optional[float]
    top_merchant_category: Optional[str]
    uploaded_at: str
    status: Literal['PARSED', 'FAILED']
    error: Optional[str] = None

    @staticmethod
    def create(
        filename: str,
        issuer: str = 'UNKNOWN',
        card_last4: Optional[str] = None,
        card_variant: Optional[str] = None,
        total_balance: Optional[float] = None,
        transaction_count: Optional[int] = None,
        interest_charges: Optional[float] = None,
        top_merchant_category: Optional[str] = None,
        status: str = 'PARSED',
        error: Optional[str] = None
    ):
        return ParsedRecord(
            id=str(uuid.uuid4()),
            filename=filename,
            issuer=issuer,
            card_last4=card_last4,
            card_variant=card_variant,
            total_balance=total_balance,
            transaction_count=transaction_count,
            interest_charges=interest_charges,
            top_merchant_category=top_merchant_category,
            uploaded_at=datetime.utcnow().isoformat() + 'Z',
            status=status,
            error=error
        )

    def to_dict(self):
        return asdict(self)
