from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupplierBase(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    category: str
    address: Optional[str] = None
    lead_time_days: int = 3

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RestokRecommendationItem(BaseModel):
    sku: str
    product_name: str
    current_stock: int
    min_stock: int
    category: str
    recommended_reorder_qty: int
    suggested_supplier: str
    supplier_phone: str
    lead_time_days: int
    urgency_level: str
