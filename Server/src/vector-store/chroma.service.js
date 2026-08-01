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
      
   
      chunkIndex: chunk.chunk_index,
    })),
  });
}

/**
 * Finds the most similar chunks to a query embedding, scoped to one document.
 * @param {string} documentId
 * @param {number[]} queryEmbedding
 * @param {number} topK - how many chunks to retrieve
 * @returns {Promise<{ id: string, content: string, chunkIndex: number, distance: number }[]>}
 */
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
  const metadatas = result.metadatas[0] ?? [];

  return ids.map((id, i) => ({
    id,
    content: documents[i],
    chunkIndex: metadatas[i]?.chunkIndex,
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
