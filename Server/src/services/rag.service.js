// File: src/services/rag.service.js

import { getDocumentById } from './document.service.js';
import { retrieveRelevantChunks } from './retrieval.service.js';
import { generateAnswer } from '../ai/gemini-chat.service.js';
import { RAG_SYSTEM_INSTRUCTION, buildRagUserPrompt } from '../prompts/rag-answer.prompt.js';
import { AppError } from '../utils/AppError.js';
import * as chatRepository from '../repositories/chat.repository.js';
import { getSessionOrThrow } from './chat.service.js';

// Number of previous messages to include
const MAX_HISTORY_MESSAGES = 10;

/**
 * Answer a question without chat history.
 *
 * @param {string} documentId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: { chunkIndex: number, distance: number }[] }>}
 */
export async function answerQuestion(documentId, question) {
  validateQuestion(question);

  const document = await getDocumentById(documentId);
  assertDocumentReady(document);

  const chunks = await retrieveRelevantChunks(documentId, question);

  if (chunks.length === 0) {
    return emptyRetrievalResult();
  }

  const userPrompt = buildRagUserPrompt(chunks, question);

  const answer = await generateAnswer(RAG_SYSTEM_INSTRUCTION, [
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ]);

  return {
    answer,
    sources: toSources(chunks),
  };
}

/**
 * Answer a question within a chat session.
 *
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: object[], sessionId: string }>}
 */
export async function answerQuestionInSession(sessionId, question) {
  validateQuestion(question);

  const session = await getSessionOrThrow(sessionId);
  const document = await getDocumentById(session.document_id);

  assertDocumentReady(document);

  const chunks = await retrieveRelevantChunks(session.document_id, question);

  // Save the user's message
  await chatRepository.createMessage(sessionId, 'user', question);

  const priorMessages = await chatRepository.findMessagesBySession(
    sessionId,
    MAX_HISTORY_MESSAGES
  );

  // Build conversation history
  const historyTurns = priorMessages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  if (chunks.length === 0) {
    const result = emptyRetrievalResult();

    await chatRepository.createMessage(sessionId, 'assistant', result.answer);

    return {
      ...result,
      sessionId,
    };
  }

  const userPrompt = buildRagUserPrompt(chunks, question);

  const contents = [
    ...historyTurns,
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  const answer = await generateAnswer(RAG_SYSTEM_INSTRUCTION, contents);

  await chatRepository.createMessage(sessionId, 'assistant', answer);

  return {
    answer,
    sources: toSources(chunks),
    sessionId,
  };
}

function validateQuestion(question) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new AppError('question is required', 400);
  }
}

function assertDocumentReady(document) {
  if (document.status !== 'ready') {
    throw new AppError(
      `Document is not ready for questions yet (status: ${document.status})`,
      409
    );
  }
}

function emptyRetrievalResult() {
  return {
    answer: "I couldn't find any relevant content in this document to answer that question.",
    sources: [],
  };
}

function toSources(chunks) {
  return chunks.map((chunk) => ({
    chunkIndex: chunk.chunkIndex,
    distance: chunk.distance,
  }));
}