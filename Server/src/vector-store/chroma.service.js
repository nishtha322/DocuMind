// File: src/vector-store/chroma.service.js

import { getCollection } from '../config/chroma.js';

/**
 * Store chunk embeddings in Chroma.
 *
 * @param {string} documentId
 * @param {{ id: string, content: string, chunkIndex: number }[]} chunks
 * @param {number[][]} embeddings
 */
export async function storeChunkEmbeddings(documentId, chunks, embeddings) {
  const collection = await getCollection();

  await collection.add({
    // Use chunk UUIDs as vector IDs
    ids: chunks.map((chunk) => chunk.id),
    embeddings,
    documents: chunks.map((chunk) => chunk.content),
    metadatas: chunks.map((chunk) => ({
      documentId,
      chunkIndex: chunk.chunk_index,
    })),
  });
}

/**
 * Find similar chunks for a query.
 *
 * @param {string} documentId
 * @param {number[]} queryEmbedding
 * @param {number} topK
 * @returns {Promise<{ id: string, content: string, chunkIndex: number, distance: number }[]>}
 */
export async function findSimilarChunks(documentId, queryEmbedding, topK = 5) {
  const collection = await getCollection();

  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where: { documentId },
  });

  // Convert the response into a simpler format
  const ids = result.ids[0] ?? [];
  const documents = result.documents[0] ?? [];
  const distances = result.distances[0] ?? [];
  const metadatas = result.metadatas[0] ?? [];

  return ids.map((id, i) => ({
    id,
    content: documents[i],
    chunkIndex: metadatas[i]?.chunkIndex,
    distance: distances[i],
  }));
}

/**
 * Delete all vectors for a document.
 *
 * @param {string} documentId
 */
export async function deleteDocumentVectors(documentId) {
  const collection = await getCollection();

  await collection.delete({
    where: { documentId },
  });
}