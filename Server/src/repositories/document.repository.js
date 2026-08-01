// src/repositories/document.repository.js

import { pool } from '../config/db.js';

export async function createDocument({ userId, originalFilename, storagePath }) {
  const query = `
    INSERT INTO documents (user_id, original_filename, storage_path)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [userId, originalFilename, storagePath]);
  return rows[0];
}

export async function findDocumentById(id) {
  const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1;', [id]);
  return rows[0] || null;
}

export async function findDocumentsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC;',
    [userId]
  );

  return rows;
}

export async function updateDocumentStatus(id, status, errorMessage = null) {
  const query = `
    UPDATE documents
    SET status = $2, error_message = $3, updated_at = now()
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id, status, errorMessage]);
  return rows[0] || null;
}

// Related chunks and chat sessions are removed automatically via ON DELETE CASCADE
export async function deleteDocument(id) {
  const { rowCount } = await pool.query('DELETE FROM documents WHERE id = $1;', [id]);
  return rowCount > 0;
}