// src/services/chat.service.js

import * as chatRepository from '../repositories/chat.repository.js';
import { getDocumentById } from './document.service.js';
import { AppError } from '../utils/AppError.js';


export async function startSession(documentId, title = null) {
  await getDocumentById(documentId);
  return chatRepository.createSession(documentId, title);
}

export async function listSessions(documentId) {
  await getDocumentById(documentId);
  return chatRepository.findSessionsByDocument(documentId);
}

export async function getSessionOrThrow(sessionId) {
  const session = await chatRepository.findSessionById(sessionId);
  if (!session) {
    throw new AppError(`Chat session not found: ${sessionId}`, 404);
  }
  return session;
}

export async function getSessionMessages(sessionId) {
  await getSessionOrThrow(sessionId);
  return chatRepository.findMessagesBySession(sessionId);
}
