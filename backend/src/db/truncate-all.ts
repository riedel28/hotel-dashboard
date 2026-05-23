import { sql } from 'drizzle-orm';

import { db } from './pool.ts';

export async function truncateAllTables() {
  await db.execute(sql`
    DO $$ BEGIN
      TRUNCATE TABLE guests, email_verification_tokens, user_roles, monitoring_logs, reservations, rooms, users, properties, roles RESTART IDENTITY CASCADE;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END $$
  `);
}
