import { Pool, type QueryResultRow, types } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export const pool = new Pool({
  connectionString: databaseUrl
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<{ rows: T[] }> {
  return pool.query<T>(text, params);
}

// Ensure numeric/float values come back as numbers, not strings
types.setTypeParser(
  1700,
  (value) => (value === null ? null : parseFloat(value)) as unknown as string
);
types.setTypeParser(
  700,
  (value) => (value === null ? null : parseFloat(value)) as unknown as string
);
types.setTypeParser(
  701,
  (value) => (value === null ? null : parseFloat(value)) as unknown as string
);
