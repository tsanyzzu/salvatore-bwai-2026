from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from database import get_db
import models
from schemas.supplier import SupplierCreate, SupplierResponse, RestokRecommendationItem

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

@router.get("", response_model=List[SupplierResponse])
async def get_suppliers(db: Session = Depends(get_db)):
    """Get all registered suppliers from database."""
    suppliers = db.query(models.Supplier).order_by(models.Supplier.created_at.desc()).all()
    return suppliers

@router.post("", response_model=SupplierResponse)
async def create_supplier(supplier_in: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier entry."""
    supplier = models.Supplier(
        name=supplier_in.name,
        contact_person=supplier_in.contact_person,
        phone=supplier_in.phone,
        email=supplier_in.email,
        category=supplier_in.category,
        address=supplier_in.address,
        lead_time_days=supplier_in.lead_time_days
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/restock-recommendations", response_model=List[RestokRecommendationItem])
async def get_restock_recommendations(db: Session = Depends(get_db)):
    """Calculate auto-restock recommendations for low stock products using EOQ heuristics."""
    items = db.query(models.Item).all()
    suppliers = db.query(models.Supplier).all()

    supplier_map: Dict[str, models.Supplier] = {
        s.category.lower(): s for s in suppliers
    }
    default_supplier = suppliers[0] if suppliers else None

    recommendations = []
    for item in items:
        if item.stock <= item.min_stock:
            suggested_reorder_qty = max(20, (item.min_stock * 3) - item.stock)
            urgency = "KRITIS" if item.stock <= 3 else "PERLU_RESTOK"
            
            sup = supplier_map.get(item.category.lower(), default_supplier)
            sup_name = sup.name if sup else "PT Distributor Nusantara"
            sup_phone = sup.phone if sup else "0812-3456-7890"
            lead_time = sup.lead_time_days if sup else 3

            recommendations.append(
                RestokRecommendationItem(
                    sku=item.sku,
                    product_name=item.name,
                    current_stock=item.stock,
                    min_stock=item.min_stock,
                    category=item.category,
                    recommended_reorder_qty=suggested_reorder_qty,
                    suggested_supplier=sup_name,
                    supplier_phone=sup_phone,
                    lead_time_days=lead_time,
                    urgency_level=urgency
                )
            )
    return recommendations
