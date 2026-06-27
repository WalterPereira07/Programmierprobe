import { defineConfig, devices } from '@playwright/test';

const slowMo = process.env['SLOWMO'] ? Number(process.env['SLOWMO']) : 0;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  // Maximal 4 Worker lokal — verhindert Überlastung der geteilten öffentlichen API (führt sonst zu 401-Fehlern).
  workers: process.env['CI'] ? 1 : 4,
  reporter: [['html'], ['list'], ['allure-playwright']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      // Gast-Tests: kein Auth-State, keine setup-Abhängigkeit.
      name: 'e2e-guest',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { slowMo },
      },
      testMatch: /\.guest\.spec\.ts$/,
    },
    {
      // Auth-Tests: JWT aus global.setup.ts wird in jeden Browser-Kontext geladen.
      name: 'e2e-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
        launchOptions: { slowMo },
      },
      testMatch: /\.auth\.spec\.ts$/,
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
