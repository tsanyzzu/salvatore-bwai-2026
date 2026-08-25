from pydantic import BaseModel
from typing import Optional

class ReviewReplyRequest(BaseModel):
    customer_name: str
    rating: int
    review_text: str
    sentiment: str
    tone: Optional[str] = "friendly"

class ReviewReplyResponse(BaseModel):
    suggested_reply: str
    tone: str
    status: str = "success"
