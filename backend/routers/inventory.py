from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
from schemas.inventory import InventoryItem, InventoryTransaction, TransactionResponse

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("/items", response_model=List[InventoryItem])
async def get_inventory_items(db: Session = Depends(get_db)):
    """Get all inventory items from database."""
    items = db.query(models.Item).all()
    return items

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_inventory_transactions(db: Session = Depends(get_db)):
    """Get all inventory transactions from database, ordered by creation time descending."""
    transactions = db.query(models.Transaction).order_by(models.Transaction.created_at.desc()).all()
    return transactions

@router.post("/transaction")
async def add_transaction(transaction: InventoryTransaction, db: Session = Depends(get_db)):
    """Add an inventory transaction (stock in or out) and update item stock."""
    item = db.query(models.Item).filter(models.Item.sku == transaction.sku).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU '{transaction.sku}' not found"
        )

    if transaction.type == "in":
        item.stock += transaction.quantity
    elif transaction.type == "out":
        item.stock = max(0, item.stock - transaction.quantity)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transaction type '{transaction.type}'. Expected 'in' or 'out'."
        )
    
    new_txn = models.Transaction(
        sku=transaction.sku,
        type=transaction.type,
        quantity=transaction.quantity,
        note=transaction.note
    )
    db.add(new_txn)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Transaction recorded for {item.name}",
        "new_stock": item.stock,
    }
