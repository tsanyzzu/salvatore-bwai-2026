from pydantic import BaseModel
from datetime import datetime

class SentimentResult(BaseModel):
    text: str
    sentiment: str  # "positive" | "neutral" | "negative"
    confidence: float

class ReviewResponse(BaseModel):
    id: int
    customer: str
    rating: int
    text: str
    sentiment: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewSummaryResponse(BaseModel):
    total_reviews: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    avg_rating: float
    ai_insight: str

class DashboardStatsResponse(BaseModel):
    total_revenue: float
    orders_count: int
    products_count: int
    inventory_value: float
    avg_rating: float
