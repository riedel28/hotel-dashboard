import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
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
      command: 'bun run server',
      url: 'http://localhost:5001/api/health',
      reuseExistingServer: !isCI,
      timeout: 30_000
    },
    {
      command: 'bun run client',
      url: 'http://localhost:5173',
      reuseExistingServer: !isCI,
      timeout: 30_000
    }
  ]
});
