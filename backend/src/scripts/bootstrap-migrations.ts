/**
 * Bootstrap the Drizzle migration journal in the database.
 *
 * Run this once per database branch that was previously managed with `db:push`
 * to mark all existing migrations as already applied. After this, `db:migrate`
 * will work correctly for future migrations.
 *
 * Usage: bun --env-file=.env src/scripts/bootstrap-migrations.ts
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const MIGRATIONS_DIR = path.resolve(import.meta.dir, '../../drizzle');

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  entries: JournalEntry[];
}

async function bootstrap() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  console.log('Bootstrapping Drizzle migration journal...\n');

  // Read the journal
  const journalPath = path.join(MIGRATIONS_DIR, 'meta/_journal.json');
  const journal: Journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'));

  // Create the drizzle schema and migrations table
  await pool.query('CREATE SCHEMA IF NOT EXISTS "drizzle"');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  // Check if already bootstrapped
  const existing = await pool.query(
    'SELECT COUNT(*) as count FROM "drizzle"."__drizzle_migrations"'
  );
  const existingCount = Number(existing.rows[0].count);

  if (existingCount > 0) {
    console.log(
      `Migration journal already has ${existingCount} entries. Skipping bootstrap.`
    );
    await pool.end();
    return;
  }

  // Insert entries for all migrations
  for (const entry of journal.entries) {
    const migrationPath = path.join(MIGRATIONS_DIR, `${entry.tag}.sql`);
    const query = fs.readFileSync(migrationPath, 'utf-8');
    const hash = crypto.createHash('sha256').update(query).digest('hex');

    await pool.query(
      'INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES ($1, $2)',
      [hash, entry.when]
    );

    console.log(`  ✓ Marked as applied: ${entry.tag}`);
  }

  console.log(
    `\n✅ Bootstrapped ${journal.entries.length} migrations successfully.`
  );
  console.log('You can now use `bun run db:migrate` for future migrations.');

  await pool.end();
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
