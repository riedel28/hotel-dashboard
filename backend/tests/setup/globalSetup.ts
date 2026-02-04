import { execSync } from 'child_process';
import { sql } from 'drizzle-orm';

import { db } from '../../src/db/pool.ts';

export default async function setup() {
  console.log('🗄️  Setting up test database...');

  try {
    // Drop all tables if they exist to ensure clean state
    // Order matters due to foreign key constraints: user_roles -> guests -> reservations -> rooms -> properties -> roles -> users
    await db.execute(sql`DROP TABLE IF EXISTS user_roles CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS guests CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS monitoring_logs CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS rooms CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS properties CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS roles CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

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
      // Final cleanup - drop all tables in correct order
      await db.execute(sql`DROP TABLE IF EXISTS user_roles CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS guests CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS monitoring_logs CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS rooms CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS properties CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS roles CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

      console.log('✅ Test database teardown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to teardown test database:', error);
    }
  };
}
