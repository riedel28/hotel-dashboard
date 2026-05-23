const LIKELY_TEST_DB_PATTERN = /test|e2e|ci|staging|dev|local|sandbox|branch/i;

function extractDatabaseName(databaseUrl: string): string {
  const normalized = databaseUrl.replace(/^postgresql:\/\//, 'http://');
  const parsed = new URL(normalized);
  return parsed.pathname.slice(1).split('?')[0] ?? '';
}

export function assertSafeTestDatabase() {
  if (process.env.ALLOW_TEST_DB_DESTROY === 'true') {
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'Refusing to run destructive test setup: NODE_ENV must be "test". ' +
        'Run backend tests with `bun run test` (uses backend/.env.test).'
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'Refusing to run destructive test setup: DATABASE_URL is not set.'
    );
  }

  const databaseName = extractDatabaseName(databaseUrl);
  if (!LIKELY_TEST_DB_PATTERN.test(databaseName)) {
    throw new Error(
      `Refusing to drop schema on database "${databaseName}". ` +
        'Use a dedicated test database (name should suggest test/e2e/ci/dev) ' +
        'or set ALLOW_TEST_DB_DESTROY=true to override.'
    );
  }
}
