import random
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas.pos import POSCheckoutPayload, POSReceiptResponse, POSReceiptItem

router = APIRouter(prefix="/api/pos", tags=["Point of Sale"])

@router.post("/checkout", response_model=POSReceiptResponse)
async def pos_checkout(payload: POSCheckoutPayload, db: Session = Depends(get_db)):
    """Process POS sale transaction, decrement stock, and return receipt summary."""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Keranjang belanja tidak boleh kosong"
        )

    total_amount = 0.0
    receipt_items: List[POSReceiptItem] = []

    # 1. Validate items and stock
    for cart_item in payload.items:
        item = db.query(models.Item).filter(models.Item.sku == cart_item.sku).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produk dengan SKU '{cart_item.sku}' tidak ditemukan"
            )
        if item.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stok produk '{item.name}' tidak mencukupi (Tersedia: {item.stock}, Diminta: {cart_item.quantity})"
            )
        
        subtotal = item.price * cart_item.quantity
        total_amount += subtotal
        receipt_items.append(
            POSReceiptItem(
                name=item.name,
                sku=item.sku,
                price=item.price,
                quantity=cart_item.quantity,
                subtotal=subtotal
            )
        )

    # 2. Check payment sufficiency
    if payload.amount_paid < total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uang pembayaran kurang! Total: Rp {total_amount:,.0f}, Dibayar: Rp {payload.amount_paid:,.0f}"
        )

    # 3. Deduct stock and record transactions
    for cart_item in payload.items:
        item = db.query(models.Item).filter(models.Item.sku == cart_item.sku).first()
        item.stock = max(0, item.stock - cart_item.quantity)
        
        txn = models.Transaction(
            sku=item.sku,
            type="out",
            quantity=cart_item.quantity,
            note=payload.note or f"Penjualan Kasir POS ({payload.payment_method.upper()})"
        )
        db.add(txn)

    db.commit()

    receipt_no = f"INV/MB/{datetime.now().strftime('%Y%m%d')}/{random.randint(1000, 9999)}"
    change_amount = payload.amount_paid - total_amount

    return POSReceiptResponse(
        receipt_no=receipt_no,
        created_at=datetime.now(),
        items=receipt_items,
        total_amount=total_amount,
        payment_method=payload.payment_method,
        amount_paid=payload.amount_paid,
        change_amount=change_amount,
        status="success",
        message="Transaksi kasir berhasil diproses!"
    )
