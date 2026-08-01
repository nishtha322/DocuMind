// src/config/db.js
//
// WHY A CONNECTION POOL (not a single client):
// Express handles many concurrent requests. If we opened one new Postgres
// connection per request, we'd exhaust Postgres's connection limit almost
// immediately under load, and pay the (non-trivial) cost of a fresh TCP +
// auth handshake every time. A Pool keeps a set of reusable connections
// open and hands them out to queries as needed — this is the standard
// production pattern with node-postgres (`pg`).
//
// WHY THIS FILE IS THE *ONLY* PLACE THAT IMPORTS `pg` DIRECTLY:
// Every repository imports `pool` from here and calls pool.query(...).
// If we ever needed to swap the driver, add read replicas, or add query
// logging/metrics, this is the one file that changes.

import pkg from 'pg';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Reasonable defaults for a small-to-medium app. In production you'd
  // tune these against your actual traffic and Postgres's max_connections.
  max: 10, // max simultaneous connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if we can't get a connection
});

pool.on('error', (err) => {
  // Fired for errors on IDLE clients in the pool (e.g. the DB restarted).
  // This does NOT mean every query failed — but it's worth logging loudly.
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

/**
 * Verifies the database is reachable. Used at startup and by the health
 * check endpoint — fail fast and visibly rather than discovering DB
 * connectivity issues on the first real user request.
 */
export async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release(); // ALWAYS release back to the pool, even on error
  }
}
