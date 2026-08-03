# DocuMind — Frontend (Client)

The React frontend for **DocuMind**, an AI-powered Retrieval-Augmented Generation (RAG) application that enables users to upload PDF documents, ask natural language questions, and receive grounded answers based entirely on the document's content.

The frontend provides a clean, responsive interface inspired by modern AI applications such as ChatPDF, NotebookLM, and Perplexity while communicating with the DocuMind backend through a REST API.

This README covers the **frontend only**. For the backend implementation, see [`../Server/README.md`](../Server/README.md). For the complete project overview, architecture, and screenshots, see the repository's root `README.md`.

---

# Features

- Upload PDF documents using drag-and-drop or file browser
- Automatic document processing status updates
- Persistent AI chat with conversation memory
- Source citations for every AI response
- Anonymous browser sessions (no login required)
- Per-browser document isolation
- Delete uploaded documents
- Responsive sidebar and mobile-friendly layout
- Loading, empty, and error states throughout the application
- Automatic scrolling during conversations
- Live typing indicator while waiting for AI responses

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Icons | Lucide React |

The frontend intentionally avoids heavy state-management or UI frameworks to keep the application lightweight and easy to understand.

---

# Project Structure

```
src/
├── api/
│   ├── client.js
│   ├── documents.js
│   ├── chat.js
│   └── health.js
│
├── components/
│   ├── chat/
│   ├── documents/
│   ├── layout/
│   └── ui/
│
├── hooks/
│   ├── useChatSession.js
│   ├── useDocuments.js
│   ├── useDocumentStatus.js
│   └── useHealthStatus.js
│
├── pages/
│   ├── UploadPage.jsx
│   └── DocumentWorkspace.jsx
│
├── App.jsx
└── main.jsx
```

The application follows a simple architecture:

- **API Layer** handles all backend communication.
- **Hooks** contain reusable data-fetching and application logic.
- **Components** focus solely on presentation.
- **Pages** compose features into complete screens.

Axios is imported only inside the `api` folder, ensuring every backend request passes through a single HTTP client configuration.

---

# Anonymous Browser Sessions

DocuMind does not require user registration or login.

The frontend automatically communicates with the backend using secure HttpOnly cookies.

Each browser receives its own anonymous session, allowing:

- Independent document libraries
- Private chat history
- Automatic session persistence
- No authentication screens

Because the session is managed entirely by the backend, the frontend never stores user identifiers in localStorage or sessionStorage.

---

# Getting Started

## Prerequisites

The backend must already be running.

See:

```
../Server/README.md
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create a `.env` file.

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Run the Development Server

```bash
npm run dev
```

The application runs at:

```
http://localhost:5173
```

---

## Production Build

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

---

# Backend Communication

All HTTP requests are handled through a single Axios instance.

The client automatically:

- Sends credentials with every request
- Normalizes API errors
- Uses a configurable API base URL

Since anonymous sessions use secure HttpOnly cookies, Axios is configured with:

```javascript
withCredentials: true
```

No authentication tokens are stored on the client.

---

# User Experience

The frontend continuously provides feedback during long-running operations.

Examples include:

- Document upload progress
- Processing status polling
- Skeleton loading states
- Typing indicator
- Error banners
- Empty states
- Automatic scrolling

This keeps interactions responsive while the backend performs document parsing, embedding generation, and retrieval.

---

# Design Decisions

## Why React Hooks?

Custom hooks separate business logic from UI components, making the application easier to maintain and test.

---

## Why Polling?

The backend processes uploaded documents asynchronously.

Polling every few seconds provides a simple, reliable solution without introducing WebSockets or Server-Sent Events.

---

## Why Tailwind CSS v4?

Tailwind provides utility-first styling with minimal CSS while keeping components easy to customize.

---

## Why a Centralized API Layer?

Every backend request passes through the same Axios client.

This provides:

- Consistent error handling
- Shared configuration
- Credential management
- Easier maintenance

---

# Future Improvements

Potential enhancements include:

- Streaming AI responses
- Drag-and-drop multiple document uploads
- Dark mode
- Keyboard shortcuts
- Markdown rendering for AI responses
- Document search
- Better mobile gestures

---

# Author

**Nishtha Srivastava**