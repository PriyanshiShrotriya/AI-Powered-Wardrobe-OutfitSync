from fastapi import FastAPI
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommender import suggest_outfit

app = FastAPI(title="OutfitSync AI Service", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(payload: RecommendationRequest) -> RecommendationResponse:
    # This endpoint shape is stable so future ML integration can be swapped in safely.
    result = suggest_outfit(
        wardrobe=payload.wardrobe,
        weather=payload.weather,
        occasion=payload.occasion,
    )
    return RecommendationResponse(**result)
