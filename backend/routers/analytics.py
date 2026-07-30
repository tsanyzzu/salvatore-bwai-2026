from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import pandas as pd
import io

from database import get_db
import models
from schemas.analytics import (
    ReviewResponse,
    ReviewSummaryResponse,
    DashboardStatsResponse,
)
from services.ai_service import AIService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Calculate dashboard metrics dynamically from database."""
    out_transactions = db.query(models.Transaction).filter(models.Transaction.type == "out").all()
    total_revenue = 0.0
    for tx in out_transactions:
        item = db.query(models.Item).filter(models.Item.sku == tx.sku).first()
        if item:
            total_revenue += tx.quantity * item.price

    orders_count = len(out_transactions)
    products_count = db.query(models.Item).count()
    items = db.query(models.Item).all()
    inventory_value = sum(item.stock * item.price for item in items)

    avg_rating_val = db.query(func.avg(models.Review.rating)).scalar()
    avg_rating = float(avg_rating_val) if avg_rating_val is not None else 4.6

    return DashboardStatsResponse(
        total_revenue=total_revenue,
        orders_count=orders_count,
        products_count=products_count,
        inventory_value=inventory_value,
        avg_rating=round(avg_rating, 1),
    )

@router.get("/reviews", response_model=List[ReviewResponse])
async def get_reviews(db: Session = Depends(get_db)):
    """Get all saved customer reviews from database."""
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).all()
    return reviews

@router.get("/summary", response_model=ReviewSummaryResponse)
async def get_reviews_summary(db: Session = Depends(get_db)):
    """Get sentiment summary stats, distribution, and AI insights from database reviews."""
    reviews = db.query(models.Review).all()
    total = len(reviews)

    if total == 0:
        return ReviewSummaryResponse(
            total_reviews=0,
            positive_count=0,
            neutral_count=0,
            negative_count=0,
            positive_pct=0,
            neutral_pct=0,
            negative_pct=0,
            avg_rating=0.0,
            ai_insight="Belum ada ulasan yang tersimpan untuk dianalisis.",
        )

    pos = sum(1 for r in reviews if r.sentiment == "positive")
    neu = sum(1 for r in reviews if r.sentiment == "neutral")
    neg = sum(1 for r in reviews if r.sentiment == "negative")

    pos_pct = round((pos / total) * 100, 1)
    neu_pct = round((neu / total) * 100, 1)
    neg_pct = round((neg / total) * 100, 1)

    avg_rating_val = db.query(func.avg(models.Review.rating)).scalar()
    avg_rating = round(float(avg_rating_val), 1) if avg_rating_val is not None else 0.0

    review_texts = "\n".join([f"- Rating {r.rating}/5: {r.text}" for r in reviews[:15]])
    ai_insight = AIService.generate_review_insight(review_texts)

    return ReviewSummaryResponse(
        total_reviews=total,
        positive_count=pos,
        neutral_count=neu,
        negative_count=neg,
        positive_pct=pos_pct,
        neutral_pct=neu_pct,
        negative_pct=neg_pct,
        avg_rating=avg_rating,
        ai_insight=ai_insight,
    )

@router.post("/upload-reviews")
async def upload_reviews(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a CSV/Excel file of customer reviews, perform sentiment analysis, and persist to database."""
    content = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format file tidak didukung. Gunakan file .csv atau .xlsx"
            )

        review_col = None
        for col in df.columns:
            if str(col).lower() in ["review", "ulasan", "text", "komentar", "content"]:
                review_col = col
                break
        if not review_col:
            review_col = df.columns[0]

        customer_col = None
        for col in df.columns:
            if str(col).lower() in ["customer", "nama", "name", "pengguna", "user"]:
                customer_col = col
                break

        rating_col = None
        for col in df.columns:
            if str(col).lower() in ["rating", "star", "bintang", "score"]:
                rating_col = col
                break

        new_reviews = []
        positive_words = ["bagus", "mantap", "puas", "cepat", "enak", "keren", "terbaik", "good", "suka", "rekomen"]
        negative_words = ["jelek", "lama", "kecewa", "kurang", "rusak", "buruk", "bad", "telat", "mahal", "parah"]

        for idx, row in df.iterrows():
            text_val = str(row[review_col]).strip()
            cust_name = str(row[customer_col]).strip() if customer_col else f"Pelanggan #{idx+1}"

            if rating_col and pd.notna(row[rating_col]):
                try:
                    rating_val = int(float(row[rating_col]))
                except ValueError:
                    rating_val = 5
            else:
                rating_val = None

            text_lower = text_val.lower()
            pos_score = sum(1 for w in positive_words if w in text_lower)
            neg_score = sum(1 for w in negative_words if w in text_lower)

            if pos_score > neg_score:
                sentiment = "positive"
                confidence = 0.85
                if rating_val is None: rating_val = 5
            elif neg_score > pos_score:
                sentiment = "negative"
                confidence = 0.85
                if rating_val is None: rating_val = 2
            else:
                sentiment = "neutral"
                confidence = 0.75
                if rating_val is None: rating_val = 4

            rev_model = models.Review(
                customer=cust_name,
                rating=rating_val if rating_val else 5,
                text=text_val,
                sentiment=sentiment,
                confidence=confidence,
            )
            new_reviews.append(rev_model)

        if new_reviews:
            db.add_all(new_reviews)
            db.commit()

        return {
            "status": "success",
            "message": f"Berhasil mengunggah dan menganalisis {len(new_reviews)} ulasan baru!",
            "total_reviews": len(new_reviews),
            "summary": {
                "positive": sum(1 for r in new_reviews if r.sentiment == "positive"),
                "neutral": sum(1 for r in new_reviews if r.sentiment == "neutral"),
                "negative": sum(1 for r in new_reviews if r.sentiment == "negative"),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses file: {str(e)}"
        )
