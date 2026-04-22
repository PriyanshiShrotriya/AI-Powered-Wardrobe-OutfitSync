# OutfitSync AI Service

FastAPI microservice that provides a placeholder outfit recommendation endpoint.

The recommendation assembler uses a Groq-hosted language model for outfit selection.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `uvicorn app.main:app --reload --port 8000`

Set `GROQ_API_KEY` in `ai-service/.env` before starting the service.

## Endpoint

- `POST /recommend`
