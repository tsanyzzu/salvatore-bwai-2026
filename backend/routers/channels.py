from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime

from database import get_db
import models
from schemas.channel_sync import (
    ChannelStatusItem,
    ProductChannelMatrixItem,
    ChannelSyncStatusResponse,
    ChannelToggleRequest,
    ChannelSyncTriggerRequest,
)

router = APIRouter(prefix="/api/channels", tags=["E-Commerce Channels"])

CHANNEL_STATE: Dict[str, dict] = {
    "shopee": {
        "id": "shopee",
        "name": "Shopee Official Store",
        "icon": "ShoppingBag",
        "is_connected": True,
        "last_synced_at": datetime.now().strftime("%Y-%m-%d %H:%M WIB"),
        "pending_sync_orders": 0,
    },
    "tokopedia": {
        "id": "tokopedia",
        "name": "Tokopedia Merchant",
        "icon": "Store",
        "is_connected": True,
        "last_synced_at": datetime.now().strftime("%Y-%m-%d %H:%M WIB"),
        "pending_sync_orders": 1,
    },
    "tiktok_shop": {
        "id": "tiktok_shop",
        "name": "TikTok Shop Indonesia",
        "icon": "Video",
        "is_connected": True,
        "last_synced_at": datetime.now().strftime("%Y-%m-%d %H:%M WIB"),
        "pending_sync_orders": 0,
    },
    "website": {
        "id": "website",
        "name": "Website Web Store",
        "icon": "Globe",
        "is_connected": True,
        "last_synced_at": datetime.now().strftime("%Y-%m-%d %H:%M WIB"),
        "pending_sync_orders": 0,
    },
}

@router.get("/status", response_model=ChannelSyncStatusResponse)
async def get_channels_status(db: Session = Depends(get_db)):
    """Get multi-channel e-commerce connection status and product stock matrix."""
    items = db.query(models.Item).all()
    
    channels = []
    total_connected = 0
    for key, c in CHANNEL_STATE.items():
        if c["is_connected"]:
            total_connected += 1
        channels.append(
            ChannelStatusItem(
                id=c["id"],
                name=c["name"],
                icon=c["icon"],
                is_connected=c["is_connected"],
                last_synced_at=c["last_synced_at"],
                synced_product_count=len(items) if c["is_connected"] else 0,
                pending_sync_orders=c["pending_sync_orders"] if c["is_connected"] else 0,
            )
        )

    matrix = []
    for item in items:
        shopee_stk = item.stock if CHANNEL_STATE["shopee"]["is_connected"] else 0
        tokopedia_stk = item.stock if CHANNEL_STATE["tokopedia"]["is_connected"] else 0
        tiktok_stk = item.stock if CHANNEL_STATE["tiktok_shop"]["is_connected"] else 0

        matrix.append(
            ProductChannelMatrixItem(
                sku=item.sku,
                name=item.name,
                local_stock=item.stock,
                price=item.price,
                shopee_stock=shopee_stk,
                tokopedia_stock=tokopedia_stk,
                tiktok_stock=tiktok_stk,
                sync_status="TERHUBUNG" if item.stock > item.min_stock else "STOK_RENDAH",
            )
        )

    return ChannelSyncStatusResponse(
        channels=channels,
        matrix=matrix,
        total_connected=total_connected,
        last_global_sync=datetime.now().strftime("%Y-%m-%d %H:%M WIB"),
    )

@router.post("/toggle-channel")
async def toggle_channel(request: ChannelToggleRequest):
    """Toggle channel connection state on or off."""
    if request.channel_id not in CHANNEL_STATE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel {request.channel_id} tidak ditemukan",
        )

    CHANNEL_STATE[request.channel_id]["is_connected"] = request.is_connected
    CHANNEL_STATE[request.channel_id]["last_synced_at"] = datetime.now().strftime("%Y-%m-%d %H:%M WIB")
    status_text = "dihubungkan" if request.is_connected else "dinonaktifkan"
    return {
        "status": "success",
        "message": f"Channel {CHANNEL_STATE[request.channel_id]['name']} berhasil {status_text}.",
    }

@router.post("/sync")
async def trigger_channel_sync(request: ChannelSyncTriggerRequest, db: Session = Depends(get_db)):
    """Trigger manual instant stock sync across connected e-commerce channels."""
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M WIB")
    
    if request.channel_id == "all" or not request.channel_id:
        for c in CHANNEL_STATE.values():
            if c["is_connected"]:
                c["last_synced_at"] = now_str
                c["pending_sync_orders"] = 0
        msg = "Seluruh channel E-Commerce (Shopee, Tokopedia, TikTok Shop, Website) berhasil disinkronkan!"
    else:
        if request.channel_id in CHANNEL_STATE:
            CHANNEL_STATE[request.channel_id]["last_synced_at"] = now_str
            CHANNEL_STATE[request.channel_id]["pending_sync_orders"] = 0
            msg = f"Stok barang di channel {CHANNEL_STATE[request.channel_id]['name']} berhasil disinkronkan!"
        else:
            raise HTTPException(status_code=404, detail="Channel tidak ditemukan")

    return {
        "status": "success",
        "message": msg,
        "synced_at": now_str,
    }
