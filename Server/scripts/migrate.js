// scripts/migrate.js
//
// WHY A CUSTOM MIGRATION RUNNER INSTEAD OF A LIBRARY:
// This project's schema needs are simple enough that a ~30 line script
// is more transparent than pulling in node-pg-migrate. It reads every
// .sql file in /migrations in filename order and runs it. For a bigger
// team project you'd want tracked/versioned migrations (a schema_migrations
// table recording what's already been applied) — noted here as a known
// simplification, not an oversight.

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
      .sort(); // filenames are prefixed 001_, 002_... so alphabetical = chronological

    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), 'utf-8');
      logger.info(`Running migration: ${file}`);
      await client.query(sql);
    }

    logger.info('✅ All migrations applied successfully');
  } finally {
    await client.end();
  }
}

runMigrations().catch((err) => {
  logger.error({ err }, '❌ Migration failed');
  process.exit(1);
});
