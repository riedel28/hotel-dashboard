import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ['./tests/setup/globalSetup.ts'],
    // Automatically clean up after each test to ensure isolation
    clearMocks: true,
    restoreMocks: true,
    // Ensure tests run sequentially to avoid database conflicts
    // In Vitest v4, use maxWorkers: 1 instead of poolOptions.forks.singleFork
    pool: 'forks',
    maxWorkers: 1,
    // Run test files sequentially
    fileParallelism: false,
    // Increase timeout for database operations
    testTimeout: 30000
  }
});
