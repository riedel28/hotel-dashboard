import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

async function loadEnv(): Promise<void> {
  dotenv.config();
  if (!process.env.DATABASE_URL) {
    // Fallback to project root .env if running inside backend/
    dotenv.config({ path: resolve(process.cwd(), '../.env') });
  }
}

async function main(): Promise<void> {
  await loadEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required. Set it in .env or environment.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  const schemaPath = resolve(process.cwd(), 'sql/schema.sql');
  const seedPath = resolve(process.cwd(), 'sql/seed.sql');

  const [schemaSql, seedSql] = await Promise.all([
    readFile(schemaPath, 'utf8'),
    readFile(seedPath, 'utf8')
  ]);

  try {
    console.log('Dropping table if exists...');
    await pool.query('DROP TABLE IF EXISTS reservations');

    console.log('Applying schema...');
    await pool.query(schemaSql);

    console.log('Seeding data...');
    await pool.query(seedSql);

    console.log('Resetting id sequence...');
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('reservations','id'), COALESCE((SELECT MAX(id) FROM reservations), 1), true)"
    );

    console.log('Reseed complete.');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Reseed failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();


