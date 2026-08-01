// src/vector-store/chroma.service.js


import { getCollection } from '../config/chroma.js';


export async function storeChunkEmbeddings(documentId, chunks, embeddings) {
  const collection = await getCollection();

  await collection.add({

    ids: chunks.map((chunk) => chunk.id),
    embeddings,
    documents: chunks.map((chunk) => chunk.content),
    metadatas: chunks.map((chunk) => ({
      documentId,
      chunkIndex: chunk.chunkIndex,
    })),
  });
}

export async function findSimilarChunks(documentId, queryEmbedding, topK = 5) {
  const collection = await getCollection();

  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where: { documentId },
  });

  // Chroma returns parallel arrays wrapped in an outer array (one per query
  // embedding — we only ever send one). Zip them into a friendlier shape.
  const ids = result.ids[0] ?? [];
  const documents = result.documents[0] ?? [];
  const distances = result.distances[0] ?? [];

  return ids.map((id, i) => ({
    id,
    content: documents[i],
    distance: distances[i],
  }));
}

/**
 * Deletes all vectors for a document (called when a document is deleted,
 * so Chroma doesn't accumulate orphaned vectors).
 * @param {string} documentId
 */
export async function deleteDocumentVectors(documentId) {
  const collection = await getCollection();
  await collection.delete({ where: { documentId } });
}
