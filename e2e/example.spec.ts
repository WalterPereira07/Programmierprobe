import { test, expect } from '@playwright/test';

/**
 * Starter smoke test — only here to confirm the setup runs.
 * Delete or replace it with your own tests.
 *
 * Run:  npm run test:e2e
 */
test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Conduit/i);
});
