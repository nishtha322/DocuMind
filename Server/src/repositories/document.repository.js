// src/repositories/document.repository.js


import { pool } from '../config/db.js';

/**
 * Inserts a new document row.
 * @param {{ userId: string, originalFilename: string, storagePath: string }} data
 * @returns {Promise<object>} the created document row
 */
export async function createDocument({ userId, originalFilename, storagePath }) {
  const query = `
    INSERT INTO documents (user_id, original_filename, storage_path)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, originalFilename, storagePath]);
  return rows[0];
}

/**
 * Fetches a single document by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findDocumentById(id) {
  const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1;', [id]);
  return rows[0] || null;
}

/**
 * Lists all documents belonging to a user, most recent first.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function findDocumentsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC;',
    [userId]
  );
  return rows;
}

export async function updateDocumentStatus(id, status, extra = {}) {
  const { errorMessage = null, pageCount = null } = extra;
  const query = `
    UPDATE documents
    SET status = $2,
        error_message = $3,
        page_count = COALESCE($4, page_count),
        updated_at = now()
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id, status, errorMessage, pageCount]);
  return rows[0] || null;
}


export async function deleteDocument(id) {
  const { rowCount } = await pool.query('DELETE FROM documents WHERE id = $1;', [id]);
  return rowCount > 0;
}
