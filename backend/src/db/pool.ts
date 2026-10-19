import { remember } from '@epic-web/remember';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env, isProd } from '../../env.ts';
import * as schema from './schema.ts';

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
    ...(isProd() && { ssl: { rejectUnauthorized: true } })
  });
};

let client;

if (isProd()) {
  client = createPool();
} else {
  client = remember('dbPool', () => createPool());
}

export const db = drizzle({ client, schema });

/** The handle a `db.transaction` callback receives. */
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export default db;
