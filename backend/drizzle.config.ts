import { defineConfig } from 'drizzle-kit';

import env from './env';

export default defineConfig({
  schema: ['./src/db/schema.ts', './src/db/payments-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  },
  verbose: true,
  strict: true
});
