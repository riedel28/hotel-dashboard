import { execSync } from 'child_process';
import { sql } from 'drizzle-orm';

import { db } from '../../src/db/pool.ts';

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
  console.log('🗄️  Setting up test database...');

  try {
    // Drop all tables dynamically to ensure clean state
    await dropAllTables();

    // Use drizzle-kit CLI to push schema to database
    console.log('🚀 Pushing schema using drizzle-kit...');
    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
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

  return async () => {
    console.log('🧹 Tearing down test database...');

    try {
      await dropAllTables();
      console.log('✅ Test database teardown complete');
    } catch (error) {
      console.error('❌ Failed to teardown test database:', error);
    }
  };
}
