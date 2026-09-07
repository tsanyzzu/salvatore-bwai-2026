from pydantic import BaseModel
from typing import List, Optional

class ChannelStatusItem(BaseModel):
    id: str
    name: str
    icon: str
    is_connected: bool
    last_synced_at: Optional[str] = None
    synced_product_count: int
    pending_sync_orders: int

class ProductChannelMatrixItem(BaseModel):
    sku: str
    name: str
    local_stock: int
    price: float
    shopee_stock: int
    tokopedia_stock: int
    tiktok_stock: int
    sync_status: str

class ChannelSyncStatusResponse(BaseModel):
    channels: List[ChannelStatusItem]
    matrix: List[ProductChannelMatrixItem]
    total_connected: int
    last_global_sync: str

class ChannelToggleRequest(BaseModel):
    channel_id: str
    is_connected: bool

class ChannelSyncTriggerRequest(BaseModel):
    channel_id: Optional[str] = "all"
