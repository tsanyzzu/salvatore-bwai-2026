from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class POSItemInput(BaseModel):
    sku: str
    quantity: int

class POSCheckoutPayload(BaseModel):
    items: List[POSItemInput]
    payment_method: str = "cash"  # "cash" | "qris"
    amount_paid: float
    note: Optional[str] = None

class POSReceiptItem(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int
    subtotal: float

class POSReceiptResponse(BaseModel):
    receipt_no: str
    created_at: datetime
    items: List[POSReceiptItem]
    total_amount: float
    payment_method: str
    amount_paid: float
    change_amount: float
    status: str = "success"
    message: str
