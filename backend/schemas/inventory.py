from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItem(BaseModel):
    id: Optional[int] = None
    name: str
    sku: str
    stock: int
    min_stock: int = 10
    price: float
    category: str

    class Config:
        from_attributes = True

class InventoryTransaction(BaseModel):
    sku: str
    type: str  # "in" | "out"
    quantity: int
    note: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    sku: str
    type: str
    quantity: int
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
