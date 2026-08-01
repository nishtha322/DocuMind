// src/repositories/chunk.repository.js


import { pool } from '../config/db.js';

/**
 * Inserts multiple chunks for a document in a single query.
 * @param {string} documentId
 * @param {string[]} chunkTexts - ordered array of chunk content
 * @returns {Promise<object[]>} the inserted chunk rows
 */
export async function insertChunks(documentId, chunkTexts) {
  if (chunkTexts.length === 0) return [];

  // Build a parameterized multi-row INSERT:
  // INSERT INTO document_chunks (document_id, chunk_index, content)
  // VALUES ($1,$2,$3), ($4,$5,$6), ...
  const values = [];
  const placeholders = chunkTexts.map((content, i) => {
    const base = i * 3;
    values.push(documentId, i, content);
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  });

  const query = `
    INSERT INTO document_chunks (document_id, chunk_index, content)
    VALUES ${placeholders.join(', ')}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

/**
 * Marks a set of chunks as embedded by setting their chroma_vector_id.
 * We use the chunk's own UUID as its Chroma vector ID (see chroma.service.js),
 * so this just confirms/records that the embedding step completed for these rows.
 * @param {string[]} chunkIds
 */
export async function markChunksEmbedded(chunkIds) {
  if (chunkIds.length === 0) return;
  await pool.query(
    `UPDATE document_chunks SET chroma_vector_id = id WHERE id = ANY($1::uuid[]);`,
    [chunkIds]
  );
}

/**
 * Fetches all chunks for a document, in order.
 * @param {string} documentId
 * @returns {Promise<object[]>}
 */
export async function findChunksByDocumentId(documentId) {
  const { rows } = await pool.query(
    'SELECT * FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC;',
    [documentId]
  );
  return rows;
}
