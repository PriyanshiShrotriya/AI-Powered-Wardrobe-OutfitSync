# OutfitSync Server

Express API for auth, wardrobe management, and outfit recommendations.

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/wardrobe`
- `GET /api/wardrobe`
- `DELETE /api/wardrobe/:id`
- `POST /api/outfit/recommend`
