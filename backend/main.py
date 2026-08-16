"""
MikroBoost — FastAPI Backend
Smart UMKM Platform API
Clean Architecture Entrypoint
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, get_db
import models
from routers import inventory, marketing, analytics, pos, suppliers

# ===== App Initialization =====
app = FastAPI(
    title="MikroBoost API",
    description="Backend API for MikroBoost — Smart UMKM Platform",
    version="1.0.0",
)

# ===== CORS Middleware =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Include Routers =====
app.include_router(inventory.router)
app.include_router(marketing.router)
app.include_router(analytics.router)
app.include_router(pos.router)
app.include_router(suppliers.router)

# ===== Database Init & Seeding =====
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    if db.query(models.Item).count() == 0:
        print("Seeding initial inventory data...")
        initial_items = [
            models.Item(name="Kopi Arabica Toraja 250g", sku="KAT-250", stock=45, min_stock=10, price=85000, category="Kopi"),
            models.Item(name="Gula Aren Organik 500g", sku="GAO-500", stock=8, min_stock=15, price=35000, category="Bahan"),
            models.Item(name="Tumbler Bambu Eco 350ml", sku="TBE-350", stock=120, min_stock=20, price=125000, category="Merchandise"),
            models.Item(name="Sambal Matah Homemade 200ml", sku="SMH-200", stock=3, min_stock=10, price=28000, category="Makanan"),
        ]
        db.add_all(initial_items)
        db.commit()

    if db.query(models.Review).count() == 0:
        print("Seeding initial review data...")
        initial_reviews = [
            models.Review(customer="Budi S.", rating=5, text="Produk sangat berkualitas, pengiriman cepat!", sentiment="positive", confidence=0.95),
            models.Review(customer="Ani R.", rating=4, text="Barangnya bagus tapi packaging bisa lebih baik.", sentiment="neutral", confidence=0.85),
            models.Review(customer="Dedi W.", rating=2, text="Pengiriman terlambat 3 hari, kecewa.", sentiment="negative", confidence=0.90),
            models.Review(customer="Siti N.", rating=5, text="Repeat order! Selalu puas sama kualitasnya.", sentiment="positive", confidence=0.98),
        ]
        db.add_all(initial_reviews)
        db.commit()

    if db.query(models.Supplier).count() == 0:
        print("Seeding initial supplier data...")
        initial_suppliers = [
            models.Supplier(name="PT Kopi Nusantara Jaya", contact_person="Hendra Suwito", phone="0812-9988-7766", email="order@kopinusantara.co.id", category="Kopi", address="Bandung, Jawa Barat", lead_time_days=2),
            models.Supplier(name="CV Bahan Organik Berkah", contact_person="Rina Melati", phone="0856-4433-2211", email="sales@bahanorganik.id", category="Bahan", address="Bogor, Jawa Barat", lead_time_days=3),
            models.Supplier(name="UD Eco Merchandise", contact_person="Bambang Purwanto", phone="0813-1122-3344", email="info@ecomerch.com", category="Merchandise", address="Surabaya, Jawa Timur", lead_time_days=4),
        ]
        db.add_all(initial_suppliers)
        db.commit()


@app.get("/api/health", tags=["Health Check"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "MikroBoost API", "version": "1.0.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
