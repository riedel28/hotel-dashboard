import { execSync } from 'child_process';

import { sql } from 'drizzle-orm';

import { db } from '../../src/db/pool.ts';
import { assertSafeTestDatabase } from '../helpers/assert-test-database.ts';

async function dropAllTables() {
  const result = await db.execute(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `);
  for (const row of result.rows) {
    await db.execute(
      sql`DROP TABLE IF EXISTS ${sql.identifier(row.tablename as string)} CASCADE`
    );
  }
  // The migration journal lives in its own schema; without this the migrator
  // would consider every migration already applied to the emptied database.
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
}

export default async function setup() {
  assertSafeTestDatabase();

  console.log('🗄️  Setting up test database...');

  try {
    await dropAllTables();

    // Build the schema from the migration files rather than `push`, so a
    // schema change without its migration fails here instead of in production.
    console.log('🚀 Applying migrations using drizzle-kit...');
    execSync('bunx drizzle-kit migrate', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}
