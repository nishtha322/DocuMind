# DocuMind Backend

A backend-first Retrieval-Augmented Generation (RAG) API that allows users to upload PDF documents and ask grounded questions about their content. The backend combines PostgreSQL for relational data, ChromaDB for vector search, and the Gemini API for embeddings and answer generation.

Built as a portfolio project demonstrating modern backend engineering with Node.js, Express, PostgreSQL, ChromaDB, Gemini API, LangChain text splitters, REST API design, prompt engineering, and layered architecture.

---

## Features

- Upload PDF documents
- Automatic text extraction and chunking
- Semantic embeddings using Gemini
- Vector search with ChromaDB
- Retrieval-Augmented Generation (RAG)
- Persistent conversation memory
- RESTful API
- OpenAPI (Swagger) documentation
- Request validation using Zod
- Rate limiting
- Unit testing with Vitest

---

## Architecture

```
                 ┌──────────────┐
  PDF Upload ──▶ │   Express    │
                 │   REST API   │
                 └──────┬───────┘
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
  ┌───────────┐   ┌───────────┐   ┌─────────────┐
  │ PostgreSQL│   │  ChromaDB │   │  Gemini API │
  │ documents │   │  vectors  │   │ embeddings  │
  │ chunks    │   │           │   │ + chat      │
  │ sessions  │   │           │   │             │
  └───────────┘   └───────────┘   └─────────────┘
```

### Document ingestion

```
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Gemini Embeddings
 ↓
Store vectors in ChromaDB
 ↓
Store metadata in PostgreSQL
```

### Question answering

```
Question
 ↓
Gemini Embedding
 ↓
Similarity Search (ChromaDB)
 ↓
Build RAG Prompt
 ↓
Gemini Chat
 ↓
Grounded Answer
```

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Vector Store | ChromaDB |
| AI | Gemini API (`@google/genai`) |
| Chunking | LangChain RecursiveCharacterTextSplitter |
| Validation | Zod |
| Documentation | OpenAPI + Swagger UI |
| Logging | Pino |
| Testing | Vitest |

---

## Project Structure

```
Server/
│
├── src/
│   ├── ai/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prompts/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── vector-store/
│
├── migrations/
├── scripts/
├── tests/
├── uploads/
├── openapi.yaml
├── package.json
└── README.md
```

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Configure:

- PORT
- DATABASE_URL
- GEMINI_API_KEY

---

### Run database migrations

```bash
npm run migrate
```

---

### Start ChromaDB

```bash
chroma run --path ./chroma_data
```

---

### Start the server

```bash
npm run dev
```

The API will be available at:

```
http://localhost:5000
```

Swagger UI:

```
http://localhost:5000/api-docs
```

---

## Environment Variables

| Variable | Required |
|-----------|----------|
| PORT | Yes |
| DATABASE_URL | Yes |
| GEMINI_API_KEY | Yes |
| GEMINI_CHAT_MODEL | No |
| GEMINI_EMBEDDING_MODEL | No |
| GEMINI_EMBEDDING_DIMENSIONS | No |
| GEMINI_THINKING_LEVEL | No |
| CHROMA_HOST | No |
| CHROMA_PORT | No |

---

## API

| Endpoint | Description |
|-----------|-------------|
| POST `/api/v1/documents/upload` | Upload a PDF |
| GET `/api/v1/documents` | List documents |
| GET `/api/v1/documents/:id` | Get document |
| DELETE `/api/v1/documents/:id` | Delete document |
| GET `/api/v1/documents/:id/chunks` | View chunks |
| POST `/api/v1/documents/:id/ask` | Ask one-off question |
| POST `/api/v1/documents/:id/sessions` | Create chat session |
| GET `/api/v1/documents/:id/sessions` | List sessions |
| POST `/api/v1/sessions/:sessionId/messages` | Ask follow-up question |
| GET `/api/v1/sessions/:sessionId/messages` | Chat history |
| GET `/api/v1/health` | Health check |

Interactive API documentation is available at:

```
/api-docs
```

---

## Testing

Run unit tests:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

Current test suite:

- 24 unit tests
- Chunking service
- Document service
- RAG orchestration
- Validation middleware
- Error utilities

---

## Known Limitations

- No authentication
- No OCR for scanned PDFs
- Fixed conversation history window
- In-memory rate limiting
- Single Chroma collection for all documents

---

