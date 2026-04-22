from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional


class RecommendationRequest(BaseModel):
    wardrobe: List[Dict[str, Any]]
    weather: str
    occasion: str


class RecommendationResponse(BaseModel):
    strategy: str
    items: List[Dict[str, Any]]
    notes: str


class ImageAnalysisRequest(BaseModel):
    image_base64: str = Field(..., min_length=32)


class ImageAnalysisResponse(BaseModel):
    strategy: str
    type: str
    category: str
    color: str
    season: str
    occasion: str
    confidence: Dict[str, float]
    notes: Optional[str] = None


class ImageAnalysisJobCreateRequest(BaseModel):
    image_base64: str = Field(..., min_length=32)


class ImageAnalysisJobCreateResponse(BaseModel):
    job_id: str
    status: Literal['queued', 'processing']


class ImageAnalysisJobStatusResponse(BaseModel):
    job_id: str
    status: Literal['queued', 'processing', 'completed', 'failed']
    result: Optional[ImageAnalysisResponse] = None
    error: Optional[str] = None
