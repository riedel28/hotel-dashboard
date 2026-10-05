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
}

export default async function setup() {
  assertSafeTestDatabase();

  console.log('🗄️  Setting up test database...');

  try {
    await dropAllTables();

    console.log('🚀 Pushing schema using drizzle-kit...');
    execSync(
      `bunx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
      {
        stdio: 'inherit',
        cwd: process.cwd()
      }
    );

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}
