// File: src/repositories/user.repository.js

import { pool } from '../config/db.js';

/**
 * Get a user by ID.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1;', [
    id,
  ]);

  return rows[0] || null;
}

/**
 * Create a new anonymous user.
 *
 * @param {string} email
 * @returns {Promise<object>}
 */
export async function createAnonymousUser(email) {
  const { rows } = await pool.query(
    'INSERT INTO users (email) VALUES ($1) RETURNING *;',
    [email]
  );

  return rows[0];
}
