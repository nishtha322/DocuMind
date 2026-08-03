// File: src/services/chat.service.js

import * as chatRepository from '../repositories/chat.repository.js';
import { getDocumentById } from './document.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create a chat session for a document.
 *
 * @param {string} documentId
 * @param {string|null} title
 */
export async function startSession(documentId, title = null, userId) {
  // Make sure the document exists and belongs to this user
  await getDocumentById(documentId, userId);

  return chatRepository.createSession(documentId, title);
}

export async function listSessions(documentId, userId) {
  await getDocumentById(documentId, userId);
  return chatRepository.findSessionsByDocument(documentId);
}

export async function getSessionOrThrow(sessionId, userId) {
  const session = await chatRepository.findSessionById(sessionId);

  if (!session) {
    throw new AppError(`Chat session not found: ${sessionId}`, 404);
  }

  if (userId) {
    // Confirm the session's document belongs to this user
    await getDocumentById(session.document_id, userId);
  }

  return session;
}

export async function getSessionMessages(sessionId, userId) {
  await getSessionOrThrow(sessionId, userId);
  return chatRepository.findMessagesBySession(sessionId);
}