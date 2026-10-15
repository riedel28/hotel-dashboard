import { sql } from 'drizzle-orm';

import { db } from './pool.ts';

export async function truncateAllTables() {
  await db.execute(sql`
    DO $$ BEGIN
      TRUNCATE TABLE cms_node_images, cms_images, cms_node_translations, cms_nodes, provider_configs, devices, products, product_categories, guest_abc_entries, property_worklogs, guests, email_verification_tokens, user_roles, monitoring_logs, payments, reservations, rooms, users, properties, customers, roles RESTART IDENTITY CASCADE;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END $$
  `);
}
