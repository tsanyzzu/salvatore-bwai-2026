"""
MikroBoost — FastAPI Backend
Smart UMKM Platform API
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# ===== App Initialization =====
app = FastAPI(
    title="MikroBoost API",
    description="Backend API for MikroBoost — Smart UMKM Platform",
    version="0.1.0",
)

# ===== CORS =====
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


# ===================================================================
# MODELS
# ===================================================================

class InventoryItem(BaseModel):
    id: Optional[int] = None
    name: str
    sku: str
    stock: int
    min_stock: int = 10
    price: float
    category: str


class InventoryTransaction(BaseModel):
    sku: str
    type: str  # "in" | "out"
    quantity: int
    note: Optional[str] = None


class CaptionRequest(BaseModel):
    product_name: str
    price: float
    description: str
    platform: str  # "instagram" | "shopee" | "whatsapp" | "all"
    tone: str      # "engaging" | "professional" | "friendly" | "urgent"


class CaptionResponse(BaseModel):
    platform: str
    caption: str
    tone: str


class SentimentResult(BaseModel):
    text: str
    sentiment: str  # "positive" | "neutral" | "negative"
    confidence: float


# ===================================================================
# IN-MEMORY DATA STORE (MVP)
# ===================================================================

inventory_db: list[InventoryItem] = [
    InventoryItem(
        id=1,
        name="Kopi Arabica Toraja 250g",
        sku="KAT-250",
        stock=45,
        min_stock=10,
        price=85000,
        category="Kopi",
    ),
    InventoryItem(
        id=2,
        name="Gula Aren Organik 500g",
        sku="GAO-500",
        stock=8,
        min_stock=15,
        price=35000,
        category="Bahan",
    ),
    InventoryItem(
        id=3,
        name="Tumbler Bambu Eco 350ml",
        sku="TBE-350",
        stock=120,
        min_stock=20,
        price=125000,
        category="Merchandise",
    ),
    InventoryItem(
        id=4,
        name="Sambal Matah Homemade 200ml",
        sku="SMH-200",
        stock=3,
        min_stock=10,
        price=28000,
        category="Makanan",
    ),
]


# ===================================================================
# ENDPOINTS — Inventory
# ===================================================================

@app.get("/api/inventory/items", response_model=list[InventoryItem])
async def get_inventory_items():
    """Get all inventory items."""
    return inventory_db


@app.post("/api/inventory/transaction")
async def add_transaction(transaction: InventoryTransaction):
    """Add an inventory transaction (stock in or out)."""
    for item in inventory_db:
        if item.sku == transaction.sku:
            if transaction.type == "in":
                item.stock += transaction.quantity
            elif transaction.type == "out":
                item.stock = max(0, item.stock - transaction.quantity)
            return {
                "status": "success",
                "message": f"Transaction recorded for {item.name}",
                "new_stock": item.stock,
            }
    return {"status": "error", "message": f"SKU '{transaction.sku}' not found"}


# ===================================================================
# ENDPOINTS — Marketing (AI Copywriter)
# ===================================================================

@app.post("/api/marketing/generate", response_model=list[CaptionResponse])
async def generate_caption(request: CaptionRequest):
    """
    Generate marketing captions using AI.
    TODO: Integrate with LLM provider (OpenAI / Gemini).
    Currently returns mock data.
    """
    mock_captions = [
        CaptionResponse(
            platform="Instagram",
            caption=f"☕ {request.product_name} — produk terbaik untuk Anda!\n\n💰 Harga: Rp {request.price:,.0f}\n📦 Order sekarang!\n\n#UMKM #ProdukLokal",
            tone=request.tone,
        ),
        CaptionResponse(
            platform="Shopee",
            caption=f"🔥 BEST SELLER! {request.product_name}\n\n{request.description}\n\n⭐ Harga: Rp {request.price:,.0f}\n\nOrder sekarang!",
            tone=request.tone,
        ),
    ]
    return mock_captions


# ===================================================================
# ENDPOINTS — Analytics (Sentiment Analysis)
# ===================================================================

@app.post("/api/analytics/upload-reviews")
async def upload_reviews(file: UploadFile = File(...)):
    """
    Upload a CSV file of customer reviews for sentiment analysis.
    TODO: Integrate with NLP model for real sentiment analysis.
    Currently returns mock results.
    """
    content = await file.read()
    lines = content.decode("utf-8").strip().split("\n")
    
    # Skip header, mock sentiment for each line
    results = []
    for i, line in enumerate(lines[1:], start=1):
        results.append(
            SentimentResult(
                text=line.strip()[:100],
                sentiment=["positive", "neutral", "negative"][i % 3],
                confidence=0.85 + (i % 10) * 0.01,
            )
        )

    return {
        "status": "success",
        "total_reviews": len(results),
        "results": results,
        "summary": {
            "positive": sum(1 for r in results if r.sentiment == "positive"),
            "neutral": sum(1 for r in results if r.sentiment == "neutral"),
            "negative": sum(1 for r in results if r.sentiment == "negative"),
        },
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "MikroBoost API", "version": "0.1.0"}


# ===================================================================
# ENTRYPOINT
# ===================================================================

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
