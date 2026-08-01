// File: src/api/chat.js

import { apiClient } from './client';

/**
 * Create a chat session.
 *
 * @param {string} documentId
 * @param {string} [title]
 * @returns {Promise<object>}
 */
export async function createSession(documentId, title) {
  const response = await apiClient.post(
    `/documents/${documentId}/sessions`,
    title ? { title } : {}
  );

  return response.data.data;
}

/**
 * Get all chat sessions for a document.
 *
 * @param {string} documentId
 * @returns {Promise<object[]>}
 */
export async function listSessions(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/sessions`);

  return response.data.data;
}

/**
 * Get messages for a chat session.
 *
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getSessionMessages(sessionId) {
  const response = await apiClient.get(`/sessions/${sessionId}/messages`);

  return response.data.data;
}

/**
 * Send a message in a chat session.
 *
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: object[], sessionId: string }>}
 */
export async function askInSession(sessionId, question) {
  const response = await apiClient.post(
    `/sessions/${sessionId}/messages`,
    { question }
  );

  return response.data.data;
}