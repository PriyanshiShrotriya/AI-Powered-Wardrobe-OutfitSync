from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from threading import Lock
from app.schemas.recommendation import (
    ImageAnalysisJobCreateRequest,
    ImageAnalysisJobCreateResponse,
    ImageAnalysisJobStatusResponse,
    ImageAnalysisRequest,
    ImageAnalysisResponse,
)
from app.services.analysis_jobs import analysis_job_store
from app.services.image_analyzer import analyze_clothing_image, warm_classifier_async
from app.models import OutfitRequest, OutfitSuggestion
from app.retrieval import WardrobeRetriever
from app.assembler import OutfitAssembler

app = FastAPI(title="OutfitSync AI Service", version="0.1.0")


# Reuse expensive components across requests to avoid repeated model/client setup.
retriever = None
retriever_error = None
retriever_lock = Lock()
assembler = None


def get_retriever() -> WardrobeRetriever:
    global retriever, retriever_error

    if retriever is not None:
        return retriever

    with retriever_lock:
        if retriever is not None:
            return retriever
        try:
            retriever = WardrobeRetriever()
            retriever_error = None
            return retriever
        except Exception as exc:
            retriever_error = str(exc)
            raise


@app.on_event("startup")
async def startup_event() -> None:
    global assembler
    warm_classifier_async()
    try:
        assembler = OutfitAssembler()
    except Exception as exc:
        # Keep the service available for image analysis endpoints even if GROQ key is missing.
        print(f"Warning: OutfitAssembler is unavailable at startup: {exc}")


@app.get("/health")
async def health() -> dict:
    if retriever is not None:
        recommendation_model = "ready"
    elif retriever_error is not None:
        recommendation_model = "unavailable"
    else:
        recommendation_model = "not_initialized"

    return {
        "status": "ok",
        "recommendation_model": recommendation_model,
    }


@app.post("/recommend", response_model=OutfitSuggestion)
async def recommend(payload: OutfitRequest) -> OutfitSuggestion:
    """
    Generate an outfit recommendation using AI-powered wardrobe retrieval and assembly.
    
    Process:
    1. Retrieve candidate items from wardrobe filtered by weather, occasion, and color
    2. Rank candidates using CLIP semantic embeddings for style relevance
    3. Assemble the best outfit using a Groq-hosted language model based on fashion principles
    
    Args:
        payload: OutfitRequest containing wardrobe, weather, occasion, and user preferences
        
    Returns:
        OutfitSuggestion with complete outfit (top, bottom, shoes) and optional 
        outerwear/accessory, plus reasoning and style score
        
    Raises:
        HTTPException 422: If outfit cannot be assembled (incomplete wardrobe)
        HTTPException 500: For other unexpected errors (API failures, etc.)
    """
    try:
        global assembler
        if assembler is None:
            assembler = OutfitAssembler()

        # Step 1: Get filtered and ranked candidates per category.
        candidates = await run_in_threadpool(get_retriever().get_candidates, payload)

        # Step 2: Assemble outfit from candidates.
        outfit = await run_in_threadpool(assembler.assemble, payload, candidates)
        
        return outfit
        
    except ValueError as e:
        # Catch outfit assembly errors (incomplete outfit, missing items, etc.)
        raise HTTPException(
            status_code=422,
            detail=f"Unable to assemble outfit: {str(e)}"
        )
    except Exception as e:
        # Catch all other errors (API failures, configuration issues, etc.)
        print(f"Error in outfit recommendation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Outfit recommendation failed: {str(e)}"
        )


@app.post("/analyze-item", response_model=ImageAnalysisResponse)
async def analyze_item(payload: ImageAnalysisRequest) -> ImageAnalysisResponse:
    result = analyze_clothing_image(payload.image_base64)
    return ImageAnalysisResponse(**result)


@app.post("/analyze-item/jobs", response_model=ImageAnalysisJobCreateResponse)
async def create_image_analysis_job(
    payload: ImageAnalysisJobCreateRequest,
) -> ImageAnalysisJobCreateResponse:
    job = analysis_job_store.submit_image_analysis(payload.image_base64)
    return ImageAnalysisJobCreateResponse(job_id=job.job_id, status=job.status)


@app.get("/analyze-item/jobs/{job_id}", response_model=ImageAnalysisJobStatusResponse)
async def get_image_analysis_job(job_id: str) -> ImageAnalysisJobStatusResponse:
    job = analysis_job_store.get_job(job_id)
    if job is None:
        return ImageAnalysisJobStatusResponse(job_id=job_id, status='failed', error='Job not found')

    result = ImageAnalysisResponse(**job.result) if job.result else None
    return ImageAnalysisJobStatusResponse(
        job_id=job.job_id,
        status=job.status,
        result=result,
        error=job.error,
    )
