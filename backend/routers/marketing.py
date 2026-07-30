from fastapi import APIRouter, HTTPException, status
from typing import List

from schemas.marketing import (
    CaptionRequest,
    CaptionResponse,
    TrendAnalysisRequest,
    CreativeGenerateRequest,
    CreativeResponse,
    SimulatePostRequest,
)
from services.ai_service import AIService

router = APIRouter(prefix="/api/marketing", tags=["Marketing"])

@router.post("/generate", response_model=List[CaptionResponse])
async def generate_caption(request: CaptionRequest):
    """Generate marketing captions using Google Gemini AI or fallback engine."""
    try:
        results = AIService.generate_captions(
            product_name=request.product_name,
            price=request.price,
            description=request.description,
            platform=request.platform,
            tone=request.tone,
        )
        return [CaptionResponse(**r) for r in results]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal generate caption: {str(e)}"
        )

@router.post("/analyze-trends")
async def analyze_trends(request: TrendAnalysisRequest):
    """Analyze marketing trends for a product using Google Gemini."""
    try:
        analysis_text = AIService.analyze_trends(
            product_name=request.product_name,
            description=request.description,
        )
        return {"status": "success", "analysis": analysis_text}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menganalisis tren: {str(e)}"
        )

@router.post("/generate-creative", response_model=List[CreativeResponse])
async def generate_creative(request: CreativeGenerateRequest):
    """Generate video hook storyboard and caption for selected social media platforms."""
    try:
        results = AIService.generate_creative_hooks(
            product_name=request.product_name,
            price=request.price,
            description=request.description,
            platforms=request.platforms,
            mode=request.mode,
            custom_prompt=request.prompt,
        )
        return [CreativeResponse(**r) for r in results]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal generate creative hooks: {str(e)}"
        )

@router.post("/simulate-post")
async def simulate_post(request: SimulatePostRequest):
    """Simulate posting content to a social media platform."""
    return {
        "status": "success",
        "message": f"Konten berhasil diunggah secara otomatis ke {request.platform}!",
        "platform": request.platform,
        "timestamp": "Baru saja",
    }
