// src/config/chroma.js


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

export async function testChromaConnection() {
  await chromaClient.heartbeat();
  return true;
}
