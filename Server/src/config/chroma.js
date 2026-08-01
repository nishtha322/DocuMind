// File: src/config/chroma.js

import { ChromaClient } from 'chromadb';
import { config } from './env.js';

export const chromaClient = new ChromaClient({
  host: config.chroma.host,
  port: config.chroma.port,
});

const externalEmbeddingFunction = {
  name: 'gemini-external',
  generate: async () => {
    throw new Error(
      'This collection expects embeddings to be supplied externally via Gemini. ' +
        'Chroma should not generate its own.'
    );
  },
};

let collectionPromise = null;

/**
 * Get the app's Chroma collection.
 */
export function getCollection() {
  if (!collectionPromise) {
    collectionPromise = chromaClient.getOrCreateCollection({
      name: config.chroma.collectionName,
      embeddingFunction: externalEmbeddingFunction,
      metadata: { 'hnsw:space': 'cosine' }, // Use cosine similarity
    });
  }

  return collectionPromise;
}

/**
 * Check if the Chroma server is reachable.
 */
export async function testChromaConnection() {
  await chromaClient.heartbeat();
  return true;
}