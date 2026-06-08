"""
MikroBoost — FastAPI Backend
Smart UMKM Platform API
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import uvicorn
import google.generativeai as genai

# ===== AI Configuration =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


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


class TrendAnalysisRequest(BaseModel):
    product_name: str
    description: str


class CreativeGenerateRequest(BaseModel):
    product_name: str
    price: float
    description: str
    platforms: list[str]
    mode: str  # "fully_ai" | "prompt"
    prompt: Optional[str] = None


class CreativeResponse(BaseModel):
    platform: str
    video_hook: str
    caption: str
    tone: str


class SimulatePostRequest(BaseModel):
    platform: str
    caption: str


class SentimentResult(BaseModel):
    text: str
    sentiment: str  # "positive" | "neutral" | "negative"
    confidence: float


from sqlalchemy.orm import Session
from fastapi import Depends
from database import engine, Base, get_db
import models

# ===================================================================
# DATABASE INIT & SEEDING (Startup Event)
# ===================================================================

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


# ===================================================================
# ENDPOINTS — Inventory
# ===================================================================

@app.get("/api/inventory/items", response_model=list[InventoryItem])
async def get_inventory_items(db: Session = Depends(get_db)):
    """Get all inventory items from database."""
    items = db.query(models.Item).all()
    return items


@app.post("/api/inventory/transaction")
async def add_transaction(transaction: InventoryTransaction, db: Session = Depends(get_db)):
    """Add an inventory transaction (stock in or out) and update item stock."""
    item = db.query(models.Item).filter(models.Item.sku == transaction.sku).first()
    if not item:
        return {"status": "error", "message": f"SKU '{transaction.sku}' not found"}

    if transaction.type == "in":
        item.stock += transaction.quantity
    elif transaction.type == "out":
        item.stock = max(0, item.stock - transaction.quantity)
    
    # Record transaction
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


# ===================================================================
# ENDPOINTS — Marketing (AI Copywriter)
# ===================================================================

@app.post("/api/marketing/generate", response_model=list[CaptionResponse])
async def generate_caption(request: CaptionRequest):
    """
    Generate marketing captions using Google Gemini API.
    """
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning mock captions.")
        return [
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

    platforms = [request.platform] if request.platform != "all" else ["Instagram", "Shopee", "WhatsApp"]
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        results = []
        
        for plat in platforms:
            prompt = (
                f"Buatkan caption marketing untuk platform {plat} dengan tone {request.tone}.\n"
                f"Nama Produk: {request.product_name}\n"
                f"Harga: Rp {request.price:,.0f}\n"
                f"Deskripsi/Keunggulan: {request.description}\n"
                "Gunakan emoji yang relevan dan hashtag jika sesuai (terutama untuk Instagram). "
                "Format langsung teks caption tanpa tambahan kata-kata pengantar."
            )
            
            response = model.generate_content(prompt)
            results.append(
                CaptionResponse(
                    platform=plat.capitalize(),
                    caption=response.text.strip(),
                    tone=request.tone
                )
            )
            
        return results
    except Exception as e:
        print(f"Error generating caption: {e}")
        return [{"platform": "Error", "caption": f"Gagal generate: {str(e)}", "tone": request.tone}]


import json

@app.post("/api/marketing/analyze-trends")
async def analyze_trends(request: TrendAnalysisRequest):
    """
    Analyze marketing trends for a product using Google Gemini.
    """
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning mock trend analysis.")
        return {
            "status": "success",
            "analysis": (
                "📈 **Tren Analisis Pasar (Mock):**\n\n"
                "🎥 **TikTok:** Konten bertema ASMR pembuatan produk atau review jujur (aesthetic unboxing) sedang viral. Pengguna menyukai musik bertempo cepat dan transisi ketukan.\n\n"
                "📸 **Instagram:** Reels bertema edukasi manfaat produk dengan visual estetik minimalis dan karusel info grafis mendapatkan engagement tinggi.\n\n"
                "📺 **YouTube:** Format Shorts dengan review produk 15 detik yang fokus pada perbandingan harga vs kualitas (value-for-money) sangat diminati."
            )
        }
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Analisis tren pemasaran media sosial terkini (TikTok, Instagram, YouTube) untuk produk berikut:\n"
            f"Nama Produk: {request.product_name}\n"
            f"Deskripsi: {request.description}\n\n"
            "Berikan analisis dalam bahasa Indonesia yang ringkas, padat, dan taktis. "
            "Gunakan format Markdown tebal dan poin-poin untuk memisahkan analisis TikTok, Instagram, dan YouTube. "
            "Fokus pada taktik konten visual/video yang sedang viral (misal: ASMR, POV, Edukasi, Humor) dan audiens targetnya."
        )
        response = model.generate_content(prompt)
        return {
            "status": "success",
            "analysis": response.text.strip()
        }
    except Exception as e:
        print(f"Error analyzing trends: {e}")
        return {
            "status": "error",
            "message": f"Gagal menganalisis tren: {str(e)}"
        }


@app.post("/api/marketing/generate-creative", response_model=list[CreativeResponse])
async def generate_creative(request: CreativeGenerateRequest):
    """
    Generate video hook storyboard and caption for selected social media platforms using Gemini.
    """
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning mock creative.")
        results = []
        for platform in request.platforms:
            plat_lower = platform.lower()
            if "tiktok" in plat_lower:
                results.append(CreativeResponse(
                    platform="TikTok",
                    video_hook="🎥 Visual: Transisi cepat menuangkan kopi dengan uap mengepul hangat (aesthetic ASMR). Teks di layar: 'Kopi Toraja Asli dari Rumah Anda ☕'. Musik: Latar ketukan santai.",
                    caption="Pagi-pagi emang paling bener ditemani Kopi Arabica Toraja! Wanginya khas, rasanya mantap. ☕ Order klik link di bio! #ASMR #KopiLokal #UMKM #TikTokShop",
                    tone="Engaging"
                ))
            elif "instagram" in plat_lower:
                results.append(CreativeResponse(
                    platform="Instagram",
                    video_hook="📸 Visual: Foto estetik tumbler bambu di atas meja kayu minimalis dengan sinar matahari pagi. Teks melayang: 'Eco-friendly & Stylist Tumbler'.",
                    caption="Mulai hari produktifmu dengan tumbler bambu ramah lingkungan. Menjaga minuman tetap hangat sekaligus bumi tetap hijau. 🎋 Klik link di bio untuk diskon 10%! #EcoFriendly #TumblerBambu #Minimalis #LocalBrand",
                    tone="Friendly"
                ))
            else:
                results.append(CreativeResponse(
                    platform="YouTube",
                    video_hook="📺 Visual: Zoom-in cepat dari dekat sambal matah homemade yang disiram minyak kelapa hangat. Teks: 'Pedasnya Bikin Nagih!'",
                    caption="Sambal matah homemade dengan resep asli bali dan bahan organik pilihan. Siap jadi teman makan nasi hangatmu hari ini! 🌶️ Cek deskripsi video untuk info pemesanan. #Shorts #SambalMatah #KulinerIndonesia",
                    tone="Urgent"
                ))
        return results

    results = []
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        for platform in request.platforms:
            prompt = (
                f"Buatkan ide konten kreatif pemasaran media sosial untuk platform: {platform}.\n"
                f"Nama Produk: {request.product_name}\n"
                f"Harga: Rp {request.price:,.0f}\n"
                f"Deskripsi/Keunggulan: {request.description}\n"
                f"Mode Kampanye: {request.mode}\n"
            )
            
            if request.mode == "prompt" and request.prompt:
                prompt += f"Permintaan Khusus Pengguna: {request.prompt}\n"
                
            prompt += (
                "\nHasilkan output dalam format JSON valid dengan struktur persis seperti di bawah ini, tanpa tambahan teks pengantar atau penutup:\n"
                "{\n"
                '  "video_hook": "Deskripsi singkat visual video 15 detik (misal: Visual awal, teks di layar, musik latar)",\n'
                '  "caption": "Teks caption lengkap dengan emoji dan hashtag yang cocok dengan platform ini",\n'
                '  "tone": "Tone tulisan (misalnya: Santai, Edukatif, Menghibur, Promosional)"\n'
                "}\n"
                "Pastikan JSON valid dan dapat di-parse."
            )
            
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean JSON codeblock wrappers if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            try:
                data = json.loads(text)
                results.append(CreativeResponse(
                    platform=platform.capitalize(),
                    video_hook=data.get("video_hook", "Visual video promosi menarik."),
                    caption=data.get("caption", f"Dapatkan {request.product_name} sekarang!"),
                    tone=data.get("tone", "Friendly")
                ))
            except Exception as json_err:
                print(f"JSON Parse error for {platform}: {json_err}. Raw text: {text}")
                # Fallback if LLM fails to return strict JSON
                results.append(CreativeResponse(
                    platform=platform.capitalize(),
                    video_hook=f"Visual video promosi produk {request.product_name}.",
                    caption=text[:200] + "..." if len(text) > 200 else text,
                    tone="Friendly"
                ))
                
        return results
    except Exception as e:
        print(f"Error generating creative: {e}")
        return [{"platform": "Error", "video_hook": "Gagal generate visual hook", "caption": f"Gagal generate: {str(e)}", "tone": "Error"}]


@app.post("/api/marketing/simulate-post")
async def simulate_post(request: SimulatePostRequest):
    """
    Simulate posting the caption and visual hook to a social media platform.
    """
    return {
        "status": "success",
        "message": f"Konten berhasil diunggah secara otomatis ke {request.platform}!",
        "platform": request.platform,
        "timestamp": "Baru saja"
    }


# ===================================================================
# ENDPOINTS — Analytics (Sentiment Analysis)
# ===================================================================

import pandas as pd
import io

@app.post("/api/analytics/upload-reviews")
async def upload_reviews(file: UploadFile = File(...)):
    """
    Upload a CSV/Excel file of customer reviews for sentiment analysis.
    Uses pandas for parsing and a simple heuristic for sentiment (in MVP).
    """
    content = await file.read()
    
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"status": "error", "message": "Format file tidak didukung. Gunakan .csv atau .xlsx"}
            
        # Asumsi kolom review ada di kolom pertama atau bernama 'review'/'ulasan'
        review_col = None
        for col in df.columns:
            if col.lower() in ["review", "ulasan", "text", "komentar", "content"]:
                review_col = col
                break
        
        if not review_col:
            review_col = df.columns[0] # Fallback ke kolom pertama
            
        # Basic Sentiment Heuristic (MVP)
        # TODO: Replace with LLM batch processing for better accuracy
        positive_words = ["bagus", "mantap", "puas", "cepat", "enak", "keren", "terbaik", "good", "suka"]
        negative_words = ["jelek", "lama", "kecewa", "kurang", "rusak", "buruk", "bad", "telat", "mahal"]
        
        results = []
        for _, row in df.iterrows():
            text = str(row[review_col])
            text_lower = text.lower()
            
            pos_score = sum(1 for w in positive_words if w in text_lower)
            neg_score = sum(1 for w in negative_words if w in text_lower)
            
            if pos_score > neg_score:
                sentiment = "positive"
            elif neg_score > pos_score:
                sentiment = "negative"
            else:
                sentiment = "neutral"
                
            results.append(
                SentimentResult(
                    text=text[:100] + "..." if len(text) > 100 else text,
                    sentiment=sentiment,
                    confidence=0.8
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
        
    except Exception as e:
        return {"status": "error", "message": f"Gagal memproses file: {str(e)}"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "MikroBoost API", "version": "0.1.0"}


# ===================================================================
# ENTRYPOINT
# ===================================================================

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
