from pydantic import BaseModel
from typing import Optional, List

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
    platforms: List[str]
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
