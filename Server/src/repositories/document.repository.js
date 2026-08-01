// src/repositories/document.repository.js
//
// WHY A REPOSITORY LAYER:
// Services should describe BUSINESS logic ("create a document record",
// "mark it ready") without knowing HOW that's persisted. This file is the
// only place in the whole app allowed to write SQL for the `documents`
// table. Benefits:
//   1. Testability — services can be tested with a mocked repository,
//      no real database needed.
//   2. Swappability — if we ever moved off Postgres, only this file changes.
//   3. Readability — SQL is co-located and easy to audit for correctness/
//      injection safety in one place, instead of scattered across services.
//
// SECURITY NOTE: every query below uses parameterized placeholders ($1,
// $2, ...) — NEVER string-concatenate user input into SQL. This is what
// prevents SQL injection.

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

/**
 * Updates a document's processing status (and optionally an error message
 * or page count once known from parsing).
 * @param {string} id
 * @param {string} status - one of 'uploaded' | 'parsing' | 'embedding' | 'ready' | 'failed'
 * @param {{ errorMessage?: string|null, pageCount?: number|null }} [extra]
 * @returns {Promise<object|null>}
 */
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

/**
 * Deletes a document. Related chunks/chat_sessions cascade-delete via
 * the ON DELETE CASCADE foreign keys defined in the schema.
 * @param {string} id
 * @returns {Promise<boolean>} whether a row was deleted
 */
export async function deleteDocument(id) {
  const { rowCount } = await pool.query('DELETE FROM documents WHERE id = $1;', [id]);
  return rowCount > 0;
}
