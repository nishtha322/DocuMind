// src/services/retrieval.service.js


import { generateQueryEmbedding } from '../ai/gemini-embeddings.service.js';
import { findSimilarChunks } from '../vector-store/chroma.service.js';

const DEFAULT_TOP_K = 5;


export async function retrieveRelevantChunks(documentId, question, topK = DEFAULT_TOP_K) {
  const queryEmbedding = await generateQueryEmbedding(question);
  return findSimilarChunks(documentId, queryEmbedding, topK);
}
