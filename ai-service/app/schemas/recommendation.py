from pydantic import BaseModel
from typing import Any, List, Dict


class RecommendationRequest(BaseModel):
    wardrobe: List[Dict[str, Any]]
    weather: str
    occasion: str


class RecommendationResponse(BaseModel):
    strategy: str
    items: List[Dict[str, Any]]
    notes: str
