# VLSI-Tutor

AI-native VLSI learning platform — from fundamentals to advanced Physical Design.

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Python 3.11+, FastAPI                              |
| Database   | PostgreSQL + pgvector                              |
| AI Layer   | Provider-agnostic LLM abstraction                  |
| Knowledge  | Hybrid RAG (semantic + keyword + metadata + KG)    |
| Voice      | STT → Reasoning → TTS pipeline                     |
| Deployment | Vercel (frontend), managed PostgreSQL, cloud backend |

## Project Structure

```
VLSI-Tutor-App/
├── frontend/          Next.js App Router
├── backend/           FastAPI + Python services
├── workers/           Background jobs (ingestion, embeddings, VLSI tools)
├── infrastructure/    Docker, CI/CD, deployment configs
├── docs/              Architecture and design docs
└── docker-compose.yml Local development services
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Database

```bash
docker compose up -d
```

## License

Private — All rights reserved.
