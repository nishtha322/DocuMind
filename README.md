# DocuMind

DocuMind is a full-stack Retrieval-Augmented Generation (RAG) application that lets users upload PDF documents and ask natural language questions grounded entirely in the document's content.

The project combines a React frontend with a Node.js/Express backend, PostgreSQL for structured data, ChromaDB for vector search, and Google's Gemini models for embeddings and answer generation.

---

## Features

- Upload PDF documents
- Automatic document parsing and chunking
- Semantic search using vector embeddings
- AI-powered question answering with source citations
- Persistent conversation memory
- Document management (view, delete, restore conversations)
- Interactive API documentation (Swagger)
- Responsive React frontend
- Unit-tested backend architecture

---

## Architecture

```
                  +----------------------+
                  |    React Frontend    |
                  |  (Vite + Tailwind)   |
                  +----------+-----------+
                             |
                             | REST API
                             |
                  +----------v-----------+
                  |  Express Backend API |
                  +----------+-----------+
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
   PostgreSQL          ChromaDB          Gemini API
 Documents & Chats     Vector Search     Embeddings + Chat
```

---

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router 7
- Axios
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL
- ChromaDB
- Gemini API (`@google/genai`)
- LangChain Text Splitters
- Zod
- Vitest

---

## Project Structure

```
DocuMind/
│
├── Client/      # React frontend
├── Server/      # Express backend
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd DocuMind
```

### 2. Start the backend

See:

```
Server/README.md
```

### 3. Start the frontend

See:

```
Client/README.md
```

---

## Screenshots

> Add screenshots or a demo GIF here after completing the UI.

---

## Documentation

- **Frontend:** `Client/README.md`
- **Backend:** `Server/README.md`

---

## Project Highlights

### Backend

- Layered architecture
- Retrieval-Augmented Generation (RAG)
- Conversation memory
- PostgreSQL + ChromaDB
- OpenAPI / Swagger
- Rate limiting
- Validation with Zod
- Unit testing with Vitest

### Frontend

- Modern React architecture
- Responsive interface
- Drag-and-drop PDF upload
- Live processing status
- Source-cited conversations
- Persistent chat history
- Clean component-based design

---

## Future Improvements

- User authentication
- OCR support for scanned PDFs
- Streaming AI responses
- Document sharing
- Multi-user workspaces
- Hybrid search (keyword + vector)

---

