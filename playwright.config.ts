import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json'
      },
      dependencies: ['setup']
    },
    // WebKit is slow in CI with remote DB; run locally only
    ...(!isCI
      ? [
          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
              storageState: 'playwright/.auth/user.json'
            },
            dependencies: ['setup']
          }
        ]
      : [])
  ],
  webServer: [
    {
      command: 'bun run server:test',
      url: 'http://localhost:5001/api/health',
      reuseExistingServer: !isCI,
      timeout: 30_000,
      // Shown in the log, so a server that never gets ready says why
      stdout: 'pipe',
      env: {
        NODE_ENV: 'test'
      }
    },
    {
      // Pinned to one address, checked at that address: left to "localhost",
      // Vite (under Bun) and this readiness check could each pick a different
      // one of 127.0.0.1 and ::1, and the run timed out with Vite up. The
      // browser still opens http://localhost:5173 (baseURL), which reaches it.
      command: 'bun run client --host 127.0.0.1 --strictPort',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !isCI,
      timeout: 30_000,
      stdout: 'pipe'
    }
  ]
});
