// src/config/db.js


import pkg from 'pg';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: config.databaseUrl,

  max: 10, // max simultaneous connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if we can't get a connection
});

pool.on('error', (err) => {

  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});


 
export async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release(); 
  }
}
