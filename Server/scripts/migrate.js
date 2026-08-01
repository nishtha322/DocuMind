// scripts/migrate.js

import { readdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from 'pg';
import { config } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const { Client } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function runMigrations() {
  const client = new Client({ connectionString: config.databaseUrl });
  await client.connect();

  try {
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      // Run migrations in filename order (001_, 002_, ...)
      .sort();

    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), 'utf-8');
      logger.info(`Running migration: ${file}`);
      await client.query(sql);
    }

    logger.info('All migrations applied successfully');
  } finally {
    await client.end();
  }
}

runMigrations().catch((err) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});