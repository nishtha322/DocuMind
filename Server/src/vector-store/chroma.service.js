// src/vector-store/chroma.service.js
//
// WHY THIS FILE SITS BETWEEN services/ AND config/chroma.js:
// config/chroma.js owns the raw client + collection. This file owns the
// APPLICATION-SHAPED operations on top of it: "store these chunks",
// "find chunks similar to this vector, scoped to one document". Nothing
// outside vector-store/ should import `chromadb` or `getCollection`
// directly — same isolation principle as the repository layer for Postgres.
//
// WHY WE STORE `documentId` AS CHROMA METADATA:
// A single Chroma collection holds chunks from EVERY uploaded document.
// Without a metadata filter, a similarity search could return chunks from
// someone else's PDF. `where: { documentId }` scopes retrieval to one
// document — critical for correctness once multiple documents exist.

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
