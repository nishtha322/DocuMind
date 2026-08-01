# DocuMind — Frontend (Client)

The React frontend for **DocuMind**. A clean, minimal UI in the spirit of ChatPDF/NotebookLM/Perplexity: upload a PDF, watch it process, and have a grounded, source-cited conversation with it.

This document covers the **frontend only**. For the backend API this talks to, see [`../BACKEND_README.md`](../BACKEND_README.md). For the whole-project overview, see the [root README](../README.md).

## Tech stack

React 19 · Vite · Tailwind CSS v4 · React Router 7 · Axios · Lucide React

No Redux, Zustand, Material UI, Bootstrap, Chakra UI, or Next.js — kept deliberately minimal.

## Features

- **Upload PDF** — drag-and-drop or click-to-browse, from the sidebar or the empty state
- **Documents list** — live status per document (`uploaded → parsing → embedding → ready`/`failed`), polled automatically while processing
- **Select document** — click any document to open its chat workspace; the active one is highlighted
- **Conversations** — a chat session is created automatically on your first question; **conversation history is restored** if you revisit a document you've already talked to (persisted server-side, survives a page reload)
- **Ask questions** — Enter-to-send, live "typing" indicator while waiting on an answer
- **Sources under each answer** — every response shows which document chunks it was grounded in
- **Delete document** — with confirmation, removes it (and its chat history) from the list
- **Loading, empty, and error states** — throughout: skeleton rows while the document list loads, empty states for no documents/no messages yet, and inline error banners for failed requests (upload rejected, rate-limited, etc.)
- **Responsive** — the sidebar becomes an off-canvas drawer below tablet width
- **Auto-scroll** — the conversation view follows the latest message

## Project structure

```
src/
├── api/            Axios calls — the ONLY place axios is imported anywhere in the app
│   ├── client.js    Configured axios instance + error normalization
│   ├── documents.js Upload/list/get/delete/chunks/ask
│   ├── chat.js      Sessions + session messages (conversation memory)
│   └── health.js    Backend connectivity check
├── hooks/           Data-fetching + state logic, kept out of components
│   ├── useDocuments.js       Shared document list state
│   ├── useDocumentStatus.js  Polls a document while it's processing
│   ├── useChatSession.js     Conversation history + asking questions
│   └── useHealthStatus.js    Live backend connection status
├── components/
│   ├── layout/       AppLayout (shell), Sidebar
│   ├── ui/           StatusBadge, Spinner, ErrorBanner, SkeletonRow
│   ├── documents/    UploadDropzone, DocumentCard
│   └── chat/         MessageBubble, ChatInput, TypingIndicator
├── pages/
│   ├── UploadPage.jsx        "/" — empty state / upload entry point
│   └── DocumentWorkspace.jsx "/documents/:id" — the chat interface
├── App.jsx          Route map
└── main.jsx
```

**API layer discipline:** every function in `src/api/*.js` maps 1:1 to a real backend endpoint (see `../openapi.yaml`) — nothing invented, nothing extra. Components and hooks import from `api/`, never call `axios` directly.

**Shared state:** the document list is the one piece of state genuinely needed across pages. It's owned by a single hook (`useDocuments`), instantiated once in `AppLayout`, and passed to child routes via React Router's `Outlet` context — no Context provider boilerplate, no state management library.

## Getting started

Requires the backend running first (see [`../BACKEND_README.md`](../BACKEND_README.md)).

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. The dev server proxies any request to `/api/*` straight to the backend at `http://localhost:5000` (configured in `vite.config.js`) — this is what lets the app call relative paths like `/api/v1/documents` with **zero CORS configuration needed on the backend**.

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Design notes

- **Why Tailwind v4's `@tailwindcss/vite` plugin** instead of the classic PostCSS setup: it's the current recommended install path — no `tailwind.config.js` boilerplate; theme tokens live in `src/index.css` via `@theme`.
- **Why polling instead of WebSockets/SSE** for document processing status: the backend has no push channel, and polling every 2s is simple, stateless, and good enough for a single-user demo tool.
- **Why the chat history restore happens in a hook, not a component:** "conversation history" as a feature means checking for an existing session on mount and replaying its messages — that's data-fetching logic, not rendering logic, so it lives in `useChatSession`, not in `DocumentWorkspace.jsx`.

## Build history

Built in 3 incremental, independently-tested modules:
1. **Project setup** — Vite/React/Tailwind/Router scaffold, API layer, basic layout, backend connectivity check.
2. **Core features** — upload, document list, chat with conversation memory, sources, delete, loading/error states.
3. **UI polish** — animations, responsive off-canvas sidebar, auto-scroll, refined components, typing indicator.
