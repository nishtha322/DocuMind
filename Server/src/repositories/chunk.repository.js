// File: src/repositories/chunk.repository.js

import { pool } from '../config/db.js';

/**
 * Insert multiple chunks for a document.
 *
 * @param {string} documentId
 * @param {string[]} chunkTexts
 * @returns {Promise<object[]>}
 */
export async function insertChunks(documentId, chunkTexts) {
  if (chunkTexts.length === 0) return [];

  // Build a bulk INSERT query
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
 * Mark chunks as embedded.
 *
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
 * Get all chunks for a document.
 *
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