// src/services/retrieval.service.js


import { generateQueryEmbedding } from '../ai/gemini-embeddings.service.js';
import { findSimilarChunks } from '../vector-store/chroma.service.js';

const DEFAULT_TOP_K = 5;

/**
 * Retrieves the chunks most relevant to a question, scoped to one document.
 * @param {string} documentId
 * @param {string} question
 * @param {number} topK
 * @returns {Promise<{ id: string, content: string, chunkIndex: number, distance: number }[]>}
 */
export async function retrieveRelevantChunks(documentId, question, topK = DEFAULT_TOP_K) {
  const queryEmbedding = await generateQueryEmbedding(question);
  return findSimilarChunks(documentId, queryEmbedding, topK);
}
