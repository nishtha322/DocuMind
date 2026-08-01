# DocuMind — Backend

The backend API for **DocuMind**: a Retrieval-Augmented Generation (RAG) service that lets you upload a PDF and ask questions about it, grounded in the document's actual content, with conversation memory for natural follow-ups.

This document covers the **backend only** (Node.js/Express API, Modules 1-8). For the React frontend, see [`Client/README.md`](./Client/README.md). For the whole-project overview, see the [root README](./README.md).

## How it works

```
                 ┌──────────────┐
  PDF upload ──▶ │   Express    │
                 │   REST API   │
                 └──────┬───────┘
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
  ┌───────────┐   ┌───────────┐   ┌─────────────┐
  │ PostgreSQL│   │  ChromaDB │   │  Gemini API │
  │ documents │   │  vectors  │   │ embeddings +│
  │ chunks    │   │(per-chunk)│   │    chat     │
  │ chat log  │   │           │   │             │
  └───────────┘   └───────────┘   └─────────────┘
```

**Ingestion pipeline** (on upload): PDF → extract text (`pdf-parse`) → chunk into overlapping windows (LangChain `RecursiveCharacterTextSplitter`) → embed each chunk (Gemini `gemini-embedding-001`) → store vectors in ChromaDB, chunk text/metadata in Postgres.

**Query pipeline** (on question): embed the question → similarity search in ChromaDB, scoped to the document → build a grounded prompt from the retrieved chunks → generate an answer (Gemini `gemini-3.6-flash`) → persist the turn if it's part of a chat session.

Full architecture reasoning for every decision is documented inline in the source — see the header comment in each file under `src/`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js (ESM) | |
| API | Express.js | |
| Relational data | PostgreSQL (raw SQL, no ORM) | Transparent, reviewable schema; no ORM "magic" |
| Vector store | ChromaDB | Purpose-built for similarity search; Postgres handles relational data instead |
| Embeddings + chat | Gemini API via `@google/genai` | Current official SDK — not the deprecated `@google/generative-ai` |
| Chunking | LangChain `RecursiveCharacterTextSplitter` | Respects sentence/paragraph boundaries, not naive fixed-size cuts |
| Validation | Zod | ESM-native, composable |
| Testing | Vitest | ESM-native, zero-config with this project's `"type": "module"` setup |

## Project structure

```
src/
├── routes/          URL -> controller mapping only
├── controllers/      HTTP concerns (parse request, shape response)
├── services/         Business logic / orchestration
├── repositories/      Only layer that talks to Postgres
├── vector-store/      Only layer that talks to ChromaDB
├── ai/                Only layer that talks to Gemini
├── prompts/           Versioned prompt templates
├── middleware/         Validation, rate limiting, errors, upload
├── validators/         Zod schemas
├── config/             Env loading, DB pool, Chroma client
└── utils/              Logger, AppError, catchAsync
tests/unit/          Unit tests (mirrors src/)
migrations/          Raw SQL schema
scripts/migrate.js   Runs migrations in order
openapi.yaml         Full API spec (served at /api-docs)
```

## Getting started

```bash
npm install
cp .env.example .env   # fill in GEMINI_API_KEY and DATABASE_URL

# Postgres: point DATABASE_URL at any Postgres 14+ instance, then:
npm run migrate

# ChromaDB:
pip install chromadb --break-system-packages
chroma run --path ./chroma_data   # runs on :8000

npm run dev
```

The API is now running at `http://localhost:5000`, interactive docs at `http://localhost:5000/api-docs`.

### Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | yes | — | |
| `DATABASE_URL` | yes | — | `postgresql://user:pass@host:port/db` |
| `GEMINI_API_KEY` | yes | — | https://aistudio.google.com/apikey |
| `GEMINI_EMBEDDING_MODEL` | no | `gemini-embedding-001` | |
| `GEMINI_EMBEDDING_DIMENSIONS` | no | `768` | |
| `GEMINI_CHAT_MODEL` | no | `gemini-3.6-flash` | |
| `GEMINI_THINKING_LEVEL` | no | `LOW` | `MINIMAL`\|`LOW`\|`MEDIUM`\|`HIGH` |
| `CHROMA_HOST` | no | `localhost` | |
| `CHROMA_PORT` | no | `8000` | |

## API overview

Full interactive docs at `GET /api-docs` once running. Summary:

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/documents/upload` | Upload a PDF, runs the full ingestion pipeline |
| `GET /api/v1/documents` | List all documents |
| `GET /api/v1/documents/:id` | Document status/metadata |
| `GET /api/v1/documents/:id/chunks` | Inspect extracted chunks |
| `POST /api/v1/documents/:id/ask` | One-off question, no memory |
| `POST /api/v1/documents/:id/sessions` | Start a chat session |
| `GET /api/v1/documents/:id/sessions` | List chat sessions for a document |
| `POST /api/v1/sessions/:sessionId/messages` | Ask with conversation memory |
| `GET /api/v1/sessions/:sessionId/messages` | Full chat history |
| `DELETE /api/v1/documents/:id` | Delete a document (cascades to chunks/vectors/chat) |
| `GET /api/v1/health` | Liveness + Postgres/ChromaDB connectivity |

## Testing

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

**What's unit-tested (mocked I/O, fast, no external services needed):** orchestration logic — the upload pipeline's status transitions and failure handling, RAG's validation/guard logic (400/404/409 paths), conversation history mapping, the chunking algorithm, validation middleware, error utilities.

**What's verified by manual end-to-end testing instead:** the actual Postgres/ChromaDB/Gemini integrations — these need real (or realistically mocked) external services to mean anything. They were exercised against a real local Postgres + ChromaDB instance, and a mock Gemini server matching the real API's request/response shape, throughout development. This is a deliberate split, not a coverage gap: a unit test asserting "the SQL string contains INSERT" proves nothing a human reviewer couldn't see by reading the query.

## Known limitations / deliberate scope decisions

- **No authentication** — all documents belong to a single seeded demo user. Zod validation, rate limiting, and layered architecture are still fully in place.
- **Fixed conversation history window** (last 10 messages) rather than summarization-based memory — the simplest thing that works.
- **Single Chroma collection** for all documents, scoped by metadata filtering — simpler operationally than one collection per document.
- **In-memory rate limiting** — resets on restart, doesn't share state across multiple instances. A Redis-backed store is the production upgrade path.
- **Scanned/image-only PDFs are not supported** — no OCR step; the app fails clearly rather than silently returning an empty document.

## Modules

This backend was built in 8 incremental, independently-tested modules: project foundation, PostgreSQL integration, PDF upload & parsing, embeddings & ChromaDB, the RAG query pipeline, conversation memory, API hardening (validation/rate limiting/docs), and testing. Each module's design reasoning is documented in the source file headers under `src/`.
