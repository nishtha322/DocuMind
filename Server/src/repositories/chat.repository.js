// src/repositories/chat.repository.js


import { pool } from '../config/db.js';

/**
 * Creates a new chat session scoped to a document.
 * @param {string} documentId
 * @param {string|null} title
 * @returns {Promise<object>}
 */
export async function createSession(documentId, title = null) {
  const { rows } = await pool.query(
    `INSERT INTO chat_sessions (document_id, title) VALUES ($1, $2) RETURNING *;`,
    [documentId, title]
  );
  return rows[0];
}

/**
 * @param {string} sessionId
 * @returns {Promise<object|null>}
 */
export async function findSessionById(sessionId) {
  const { rows } = await pool.query('SELECT * FROM chat_sessions WHERE id = $1;', [sessionId]);
  return rows[0] || null;
}

/**
 * @param {string} documentId
 * @returns {Promise<object[]>}
 */
export async function findSessionsByDocument(documentId) {
  const { rows } = await pool.query(
    'SELECT * FROM chat_sessions WHERE document_id = $1 ORDER BY created_at DESC;',
    [documentId]
  );
  return rows;
}


export async function createMessage(sessionId, role, content) {
  const { rows } = await pool.query(
    `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *;`,
    [sessionId, role, content]
  );
  return rows[0];
}


export async function findMessagesBySession(sessionId, limit = 100) {
  // Fetch the most recent `limit` rows (DESC), then reverse to chronological
  // order — simpler and more efficient than a window function for this scale.
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2
     ) recent ORDER BY created_at ASC;`,
    [sessionId, limit]
  );
  return rows;
}
