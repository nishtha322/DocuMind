// src/api/chat.js
//
// Session-based Q&A (conversation memory) — mirrors the backend's
// chat_sessions / chat_messages endpoints exactly.

import { apiClient } from './client';

/**
 * POST /documents/:id/sessions — starts a new chat session for a document.
 * @param {string} documentId
 * @param {string} [title]
 * @returns {Promise<object>} the created session
 */
export async function createSession(documentId, title) {
  const response = await apiClient.post(`/documents/${documentId}/sessions`, title ? { title } : {});
  return response.data.data;
}

/**
 * GET /documents/:id/sessions — lists chat sessions for a document.
 * @param {string} documentId
 * @returns {Promise<object[]>}
 */
export async function listSessions(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/sessions`);
  return response.data.data;
}

/**
 * GET /sessions/:sessionId/messages — full chronological message history.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getSessionMessages(sessionId) {
  const response = await apiClient.get(`/sessions/${sessionId}/messages`);
  return response.data.data;
}

/**
 * POST /sessions/:sessionId/messages — asks a question WITH conversation
 * memory (the backend includes recent prior turns as context).
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: object[], sessionId: string }>}
 */
export async function askInSession(sessionId, question) {
  const response = await apiClient.post(`/sessions/${sessionId}/messages`, { question });
  return response.data.data;
}
