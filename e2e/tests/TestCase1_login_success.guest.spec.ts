import { test } from '@playwright/test';

import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { testUser } from '../test-data';

test('testCase1 - Login erfolgreich', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);

  await loginPage.goto();
  await loginPage.login(testUser.email, testUser.password);
  await homePage.expectAuthenticatedAs(testUser.username);
});
