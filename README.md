# OutfitSync Monorepo

Scalable MVP wardrobe application with:

- `client` - React + Vite + Tailwind CSS
- `server` - Node.js + Express + MongoDB (Mongoose)
- `ai-service` - FastAPI placeholder recommender

## Quick Start

### 1) Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) AI Service

```bash
cd ai-service
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3) Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/wardrobe`
- `GET /api/wardrobe`
- `DELETE /api/wardrobe/:id`
- `POST /api/outfit/recommend`

Node server attempts AI recommendation first and falls back to rule-based logic when AI service is unavailable.
