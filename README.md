# DocuMind

An AI-powered **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents and ask natural language questions grounded entirely in the document's content.

DocuMind combines semantic search, large language models, and conversation memory to provide accurate, context-aware answers while maintaining **private anonymous browser sessions**—no login required.

---

# Features

- Upload and process PDF documents
- Automatic text extraction and semantic chunking
- Retrieval-Augmented Generation (RAG)
- AI-powered question answering with source citations
- Persistent conversation memory
- Anonymous browser sessions using secure HttpOnly cookies
- Per-user document and chat isolation
- Responsive React interface
- PostgreSQL for relational data
- ChromaDB for vector similarity search
- Interactive Swagger API documentation
- Comprehensive backend unit testing

---

# Architecture

```
                      Browser
                           │
            HttpOnly Anonymous Session
                           │
                           ▼
                 React Frontend (Vite)
                           │
                      REST API
                           │
                           ▼
                Express Backend API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  PostgreSQL          ChromaDB          Gemini API
 Users                Vector Search     Embeddings
 Documents            Semantic Search   Chat Generation
 Chat History
```

---

# Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router 7
- Axios
- Lucide React

## Backend

- Node.js
- Express.js
- PostgreSQL
- ChromaDB
- Gemini API (`@google/genai`)
- LangChain
- Zod
- Swagger (OpenAPI)
- Vitest

---

# Project Structure

```
DocuMind/
│
├── Client/        React Frontend
├── Server/        Express Backend API
├── README.md
│
└── ...
```

---

# How It Works

### Document Processing

```
Upload PDF
     │
     ▼
Extract Text
     │
     ▼
Chunk Document
     │
     ▼
Generate Embeddings
     │
     ▼
Store in ChromaDB
     │
     ▼
Store Metadata in PostgreSQL
```

---

### Question Answering

```
User Question
      │
      ▼
Generate Embedding
      │
      ▼
Semantic Search
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Ground Prompt with Context
      │
      ▼
Gemini Chat Model
      │
      ▼
Answer + Sources
```

---

# Privacy

DocuMind does not require registration or login.

Each browser automatically receives a secure anonymous identity through an HttpOnly cookie.

This provides:

- Private document libraries
- Private chat history
- Browser-specific sessions
- Automatic ownership enforcement
- No shared documents between users

---

# Getting Started

Clone the repository:

```bash
git clone https://github.com/nishtha322/DocuMind.git

cd DocuMind
```

Backend setup:

```
Server/README.md
```

Frontend setup:

```
Client/README.md
```

---

# Screenshots

> Add screenshots here.

Suggested screenshots:

- Upload page
- Chat interface
- Source citations
- Swagger API
- Architecture diagram

---

# Documentation

| Component | Documentation |
|-----------|---------------|
| Backend | `Server/README.md` |
| Frontend | `Client/README.md` |

---

# Highlights

### Backend

- Layered architecture
- Retrieval-Augmented Generation
- Conversation memory
- PostgreSQL + ChromaDB integration
- Anonymous browser sessions
- HttpOnly cookie-based user isolation
- Swagger API documentation
- Zod validation
- Rate limiting
- Unit testing with Vitest

### Frontend

- Modern React architecture
- Responsive design
- Drag-and-drop uploads
- Live document processing status
- Persistent conversations
- Source-cited AI responses
- Centralized API layer
- Automatic cookie-based sessions

---

# Future Improvements

- User authentication
- OCR support for scanned PDFs
- Streaming AI responses
- Hybrid keyword + semantic search
- Multi-document querying
- Document sharing
- Background document processing

---

# Author

**Nishtha Srivastava**