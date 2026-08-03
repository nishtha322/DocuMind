# DocuMind — Backend

The backend API for **DocuMind**, an AI-powered Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents and ask natural language questions grounded entirely in the document's content. The backend manages document ingestion, vector search, conversation memory, and anonymous browser sessions while exposing a clean REST API consumed by the React frontend.

This README covers the **backend only**. For the frontend application, see [`Client/README.md`](./Client/README.md). For a complete project overview, architecture, and screenshots, refer to the repository's root `README.md`.

---

# Highlights

- Upload and process PDF documents
- Retrieval-Augmented Generation (RAG) using Google's Gemini models
- Conversation memory with persistent chat sessions
- Anonymous browser sessions using secure HttpOnly cookies
- Per-user document and chat isolation without requiring login
- PostgreSQL for relational storage
- ChromaDB for semantic vector search
- Layered architecture (Routes → Controllers → Services → Repositories)
- OpenAPI (Swagger) documentation
- Request validation with Zod
- Rate limiting and centralized error handling
- Comprehensive unit test suite with Vitest

---

# Architecture

```
                    Browser
                         │
                         │
          HttpOnly Anonymous Session Cookie
                         │
                         ▼
                Express REST API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
 PostgreSQL          ChromaDB        Gemini API
 Users               Vector Store    Embeddings
 Documents           Similarity      Chat
 Chat Sessions       Search
 Chat Messages
```

The backend follows a layered architecture where each layer has a single responsibility.

- **Routes** define API endpoints.
- **Controllers** handle HTTP concerns.
- **Services** implement business logic.
- **Repositories** interact with PostgreSQL.
- **Vector Store** handles semantic search through ChromaDB.
- **AI Services** communicate with the Gemini API.

This separation keeps the codebase maintainable, testable, and easy to extend.

---

# Anonymous Browser Sessions

DocuMind intentionally does **not require user registration or login**.

Instead, every browser automatically receives a secure anonymous identity.

When a user visits the application for the first time:

1. The backend checks for an HttpOnly cookie.
2. If no cookie exists, a new anonymous user is created.
3. The browser receives a secure HttpOnly cookie containing its anonymous identity.
4. Every subsequent request is automatically scoped to that anonymous user.

As a result:

- Documents remain private to each browser.
- Chat history is isolated.
- No authentication screens are required.
- Users cannot access another browser's documents or conversations.

---

# How It Works

## Document Ingestion Pipeline

Whenever a PDF is uploaded, the backend performs the following pipeline:

```
PDF Upload
     │
     ▼
Extract Text (pdf-parse)
     │
     ▼
Chunk Document
(LangChain RecursiveCharacterTextSplitter)
     │
     ▼
Generate Embeddings
(Gemini Embedding Model)
     │
     ▼
Store Embeddings
(ChromaDB)
     │
     ▼
Store Metadata & Chunks
(PostgreSQL)
```

Each document is converted into overlapping semantic chunks before embeddings are generated. This improves retrieval quality while preserving context between adjacent chunks.

---

## Question Answering Pipeline

When a user asks a question:

```
User Question
      │
      ▼
Generate Question Embedding
      │
      ▼
Similarity Search
(ChromaDB)
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Construct Grounded Prompt
      │
      ▼
Gemini Chat Model
      │
      ▼
Grounded Answer
      │
      ▼
Persist Conversation
(PostgreSQL)
```

Instead of sending the complete PDF to the LLM, only the most relevant chunks are retrieved using semantic search. The generated answer is therefore grounded in the uploaded document rather than relying on the model's general knowledge.

When the request belongs to an existing chat session, the backend also incorporates recent conversation history to support natural follow-up questions.

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | PostgreSQL |
| Vector Database | ChromaDB |
| Embedding Model | Gemini Embedding (`gemini-embedding-001`) |
| Chat Model | Gemini (`gemini-3.6-flash`) |
| Chunking | LangChain RecursiveCharacterTextSplitter |
| Validation | Zod |
| Logging | Pino |
| Documentation | OpenAPI (Swagger UI) |
| Testing | Vitest |
| File Uploads | Multer |
| PDF Parsing | pdf-parse |

# Project Structure

```
src/
├── ai/                    Gemini embedding and chat services
├── config/                Environment loading, PostgreSQL, ChromaDB
├── controllers/           HTTP request/response handling
├── middleware/            Validation, uploads, rate limiting, anonymous sessions
├── prompts/               Prompt templates for RAG
├── repositories/          PostgreSQL data access layer
├── routes/                API route definitions
├── services/              Business logic
├── utils/                 Logger, AppError, helpers
├── validators/            Zod schemas
└── vector-store/          ChromaDB integration

migrations/                Database schema
scripts/                   Migration scripts
tests/                     Unit tests
openapi.yaml               OpenAPI specification
```

The backend follows a layered architecture:

- **Routes** map URLs to controllers.
- **Controllers** validate requests and shape responses.
- **Services** orchestrate application logic.
- **Repositories** are the only layer that communicates with PostgreSQL.
- **Vector Store** is the only layer that communicates with ChromaDB.
- **AI Services** are the only layer that communicates with Gemini.

This separation keeps responsibilities clear and simplifies testing and maintenance.

---

# Getting Started

## Prerequisites

Before running the project, install:

- Node.js 20+
- PostgreSQL 14+
- Python 3.10+ (for ChromaDB)
- Google Gemini API Key

---

## Clone the Repository

```bash
git clone https://github.com/nishtha322/DocuMind.git

cd DocuMind/Server
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Copy the example environment file.

```bash
cp .env.example .env
```

Fill in the required values.

---

## Database Setup

Create a PostgreSQL database.

Run all migrations:

```bash
npm run migrate
```

---

## Start ChromaDB

Install ChromaDB if you haven't already:

```bash
pip install chromadb
```

Run the vector database:

```bash
chroma run --path ./chroma_data
```

By default ChromaDB starts on:

```
http://localhost:8000
```

---

## Start the Backend

```bash
npm run dev
```

The backend runs on:

```
http://localhost:5000
```

Swagger documentation:

```
http://localhost:5000/api-docs
```

---

# Environment Variables

| Variable | Required | Description |
|-----------|----------|-------------|
| `PORT` | Yes | Backend server port |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_EMBEDDING_MODEL` | No | Embedding model (default: `gemini-embedding-001`) |
| `GEMINI_CHAT_MODEL` | No | Chat model (default: `gemini-3.6-flash`) |
| `GEMINI_EMBEDDING_DIMENSIONS` | No | Embedding vector dimensions |
| `GEMINI_THINKING_LEVEL` | No | Gemini reasoning level |
| `CHROMA_HOST` | No | ChromaDB host |
| `CHROMA_PORT` | No | ChromaDB port |

Example:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/ai_document_assistant

GEMINI_API_KEY=your_api_key

GEMINI_CHAT_MODEL=gemini-3.6-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

CHROMA_HOST=localhost
CHROMA_PORT=8000
```

---

# Request Flow

Every request follows the same flow:

```
Browser
   │
   ▼
Anonymous Session Middleware
(HttpOnly Cookie)
   │
   ▼
Express Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository / AI / ChromaDB
   │
   ▼
Response
```

The anonymous session middleware automatically identifies the current browser using a secure HttpOnly cookie. Every document, chat session, and question-answer request is scoped to that anonymous user before reaching the business logic.

# API Overview

Once the backend is running, complete interactive API documentation is available at:

```
http://localhost:5000/api-docs
```

## Document APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload and process a PDF |
| GET | `/api/v1/documents` | List the current user's documents |
| GET | `/api/v1/documents/:id` | Retrieve document metadata |
| GET | `/api/v1/documents/:id/chunks` | View extracted document chunks |
| DELETE | `/api/v1/documents/:id` | Delete a document and all related data |

---

## Question Answering

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/:id/ask` | Ask a one-off question about a document |

---

## Chat Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/:id/sessions` | Create a chat session |
| GET | `/api/v1/documents/:id/sessions` | List chat sessions |
| POST | `/api/v1/sessions/:sessionId/messages` | Send a chat message |
| GET | `/api/v1/sessions/:sessionId/messages` | Retrieve chat history |

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Verify API, PostgreSQL, and ChromaDB connectivity |

---

# Testing

The backend includes a comprehensive unit test suite built with **Vitest**.

Run the tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

### Unit Tests Cover

- Document upload orchestration
- PDF processing pipeline
- Chunk generation
- Embedding workflow
- Conversation memory
- RAG service validation
- Error handling
- Middleware
- Zod validation
- Status transitions
- Failure scenarios

External services such as PostgreSQL, ChromaDB, and Gemini are mocked during unit testing to keep tests fast and deterministic.

---

# Security & Privacy

Although DocuMind does not require user accounts, every browser receives its own anonymous identity.

The backend provides:

- Anonymous browser sessions
- Secure HttpOnly cookies
- Per-user document isolation
- Per-user chat history
- Ownership validation before every protected operation
- Request validation using Zod
- Rate limiting
- Centralized error handling

Each browser can access only its own documents and conversations. Uploaded documents are never shared between anonymous users.

---

# Design Decisions

Some implementation choices were made intentionally to keep the project focused while following production-oriented architecture.

### Why PostgreSQL?

PostgreSQL stores structured application data:

- Users
- Documents
- Metadata
- Chat sessions
- Chat messages

Its relational model is a natural fit for this information.

---

### Why ChromaDB?

Semantic search requires efficient vector similarity search.

Instead of storing embeddings inside PostgreSQL, ChromaDB provides:

- Fast nearest-neighbor search
- Metadata filtering
- Scalable vector storage

---

### Why LangChain Only for Chunking?

LangChain is used only for document chunking.

Prompt construction, retrieval orchestration, and application logic remain fully custom to keep the architecture transparent.

---

### Why Anonymous Sessions?

Traditional authentication would introduce unnecessary friction for this project.

Anonymous browser sessions demonstrate:

- Cookie-based session management
- Backend authorization
- User isolation
- Secure ownership checks

without requiring login or signup.

---

# Known Limitations

- No traditional authentication (login/signup)
- Anonymous sessions are browser-specific
- Scanned PDFs requiring OCR are not supported
- Fixed conversation history window
- In-memory rate limiting (Redis would be the production upgrade)
- Single ChromaDB collection with metadata filtering

These choices simplify deployment while keeping the architecture clean and extensible.

---

# Development Modules

The backend was developed incrementally across eight modules.

1. Project setup and architecture
2. PostgreSQL integration
3. PDF upload and parsing
4. Embeddings and ChromaDB integration
5. Retrieval-Augmented Generation pipeline
6. Conversation memory
7. API hardening (validation, rate limiting, Swagger)
8. Testing and documentation

Each module builds upon the previous one while preserving clear separation of concerns.

---

# Future Improvements

Potential production enhancements include:

- User authentication (OAuth/JWT)
- OCR support for scanned PDFs
- Streaming LLM responses
- Background document processing
- Redis-backed distributed rate limiting
- Hybrid keyword + semantic search
- Multi-document querying
- Document sharing and collaboration
- Conversation summarization for long chats

---


# Author

**Nishtha Srivastava**

