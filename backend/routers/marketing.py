from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from schemas.marketing import (
    CaptionRequest,
    CaptionResponse,
    TrendAnalysisRequest,
    CreativeGenerateRequest,
    CreativeResponse,
    SimulatePostRequest,
)
from services.ai_service import AIService, get_ai_service

router = APIRouter(prefix="/api/marketing", tags=["Marketing"])


@router.post("/generate", response_model=List[CaptionResponse])
async def generate_caption(
    request: CaptionRequest, ai_service: AIService = Depends(get_ai_service)
):
    """Generate marketing captions using Google Gemini AI or fallback engine."""
    try:
        results = ai_service.generate_captions(
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
            detail=f"Gagal generate caption: {str(e)}",
        )


@router.post("/analyze-trends")
async def analyze_trends(
    request: TrendAnalysisRequest, ai_service: AIService = Depends(get_ai_service)
):
    """Analyze marketing trends for a product using Google Gemini."""
    try:
        analysis_text = ai_service.analyze_trends(
            product_name=request.product_name,
            description=request.description,
        )
        return {"status": "success", "analysis": analysis_text}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menganalisis tren: {str(e)}",
        )


@router.post("/generate-creative", response_model=List[CreativeResponse])
async def generate_creative(
    request: CreativeGenerateRequest, ai_service: AIService = Depends(get_ai_service)
):
    """Generate video hook storyboard and caption for selected social media platforms."""
    try:
        results = ai_service.generate_creative_hooks(
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
            detail=f"Gagal generate creative hooks: {str(e)}",
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
