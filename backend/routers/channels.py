from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
import models
from repositories import ChannelRepository
from schemas.channel_sync import (
    ChannelStatusItem,
    ProductChannelMatrixItem,
    ChannelSyncStatusResponse,
    ChannelToggleRequest,
    ChannelSyncTriggerRequest,
)

router = APIRouter(prefix="/api/channels", tags=["E-Commerce Channels"])


@router.get("/status", response_model=ChannelSyncStatusResponse)
async def get_channels_status(db: Session = Depends(get_db)):
    """Get multi-channel e-commerce connection status and product stock matrix."""
    repo = ChannelRepository(db)
    channels_db = repo.get_all()
    items = db.query(models.Item).all()

    channels_map = {c.id: c for c in channels_db}

    channels = []
    total_connected = 0
    for c in channels_db:
        if c.is_connected:
            total_connected += 1
        channels.append(
            ChannelStatusItem(
                id=c.id,
                name=c.name,
                icon=c.icon,
                is_connected=c.is_connected,
                last_synced_at=c.last_synced_at,
                synced_product_count=len(items) if c.is_connected else 0,
                pending_sync_orders=c.pending_sync_orders if c.is_connected else 0,
            )
        )

    shopee_conn = bool(channels_map.get("shopee") and channels_map["shopee"].is_connected)
    tokopedia_conn = bool(channels_map.get("tokopedia") and channels_map["tokopedia"].is_connected)
    tiktok_conn = bool(channels_map.get("tiktok_shop") and channels_map["tiktok_shop"].is_connected)

    matrix = []
    for item in items:
        shopee_stk = item.stock if shopee_conn else 0
        tokopedia_stk = item.stock if tokopedia_conn else 0
        tiktok_stk = item.stock if tiktok_conn else 0

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
async def toggle_channel(request: ChannelToggleRequest, db: Session = Depends(get_db)):
    """Toggle channel connection state on or off."""
    repo = ChannelRepository(db)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M WIB")
    channel = repo.update_connection(request.channel_id, request.is_connected, now_str)

    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel {request.channel_id} tidak ditemukan",
        )

    status_text = "dihubungkan" if request.is_connected else "dinonaktifkan"
    return {
        "status": "success",
        "message": f"Channel {channel.name} berhasil {status_text}.",
    }


@router.post("/sync")
async def trigger_channel_sync(
    request: ChannelSyncTriggerRequest, db: Session = Depends(get_db)
):
    """Trigger manual instant stock sync across connected e-commerce channels."""
    repo = ChannelRepository(db)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M WIB")

    if request.channel_id == "all" or not request.channel_id:
        repo.sync_all(now_str)
        msg = "Seluruh channel E-Commerce (Shopee, Tokopedia, TikTok Shop, Website) berhasil disinkronkan!"
    else:
        channel = repo.sync_channel(request.channel_id, now_str)
        if not channel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Channel tidak ditemukan"
            )
        msg = f"Stok barang di channel {channel.name} berhasil disinkronkan!"

    return {
        "status": "success",
        "message": msg,
        "synced_at": now_str,
    }
