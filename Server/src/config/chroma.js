// src/config/chroma.js
//
// WHY A SEPARATE CONFIG FILE FOR THE CHROMA CLIENT (mirroring db.js):
// Same reasoning as the Postgres pool — one client instance, reused across
// the app, and one place that knows how to construct it.
//
// WHY A CUSTOM `embeddingFunction` THAT THROWS:
// By default, Chroma collections can compute embeddings themselves from raw
// text using a built-in model. We deliberately DON'T want that — all
// embeddings in this app come from Gemini (gemini-embeddings.service.js) so
// that retrieval and storage always use the exact same embedding model and
// dimensionality. Passing a no-op embedding function makes that
// architectural decision explicit and fails loudly (instead of silently
// using a different, mismatched embedding model) if any code path ever
// forgets to supply embeddings manually.

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
      'This collection expects embeddings to be supplied externally via Gemini — ' +
        'Chroma should never compute its own.'
    );
  },
};

let collectionPromise = null;

/**
 * Returns the app's single Chroma collection, creating it on first use.
 * Cached as a promise so concurrent callers don't race to create it twice.
 */
export function getCollection() {
  if (!collectionPromise) {
    collectionPromise = chromaClient.getOrCreateCollection({
      name: config.chroma.collectionName,
      embeddingFunction: externalEmbeddingFunction,
      metadata: { 'hnsw:space': 'cosine' }, // cosine similarity — standard for text embeddings
    });
  }
  return collectionPromise;
}

/**
 * Verifies the Chroma server is reachable — used by the health check.
 */
export async function testChromaConnection() {
  await chromaClient.heartbeat();
  return true;
}
