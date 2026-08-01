// src/config/db.js

import pkg from 'pg';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Connection pool configuration
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log unexpected errors on idle connections
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

// Verify database connectivity
export async function testConnection() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}