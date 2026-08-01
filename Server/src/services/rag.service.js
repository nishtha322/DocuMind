// src/services/rag.service.js


import { getDocumentById } from './document.service.js';
import { retrieveRelevantChunks } from './retrieval.service.js';
import { generateAnswer } from '../ai/gemini-chat.service.js';
import { RAG_SYSTEM_INSTRUCTION, buildRagUserPrompt } from '../prompts/rag-answer.prompt.js';
import { AppError } from '../utils/AppError.js';

/**
 * Answers a question about a specific document using RAG.
 * @param {string} documentId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: { chunkIndex: number, distance: number }[] }>}
 */
export async function answerQuestion(documentId, question) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new AppError('question is required', 400);
  }

  const document = await getDocumentById(documentId); // throws 404 if missing

  if (document.status !== 'ready') {
    // Asking a question against a document that's still processing (or
    // failed) would silently retrieve zero chunks and produce a confusing
    // "I don't know" answer. Failing clearly here is far more useful.
    throw new AppError(
      `Document is not ready for questions yet (status: ${document.status})`,
      409
    );
  }

  const chunks = await retrieveRelevantChunks(documentId, question);

  if (chunks.length === 0) {

    return {
      answer:
        "I couldn't find any relevant content in this document to answer that question.",
      sources: [],
    };
  }

  const userPrompt = buildRagUserPrompt(chunks, question);
  const answer = await generateAnswer(RAG_SYSTEM_INSTRUCTION, userPrompt);

  return {
    answer,
    sources: chunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      distance: chunk.distance,
    })),
  };
}
