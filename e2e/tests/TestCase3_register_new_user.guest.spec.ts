import { test } from '@playwright/test';

import { HomePage } from '../pages/home.page';
import { RegisterPage } from '../pages/register.page';
import { generateUser } from '../test-data';

test('testCase3 - Registrierung eines neuen Nutzers', async ({ page }) => {
  // Timestamp-basierter Nutzer — verhindert Konflikte auf dem geteilten Backend
  const newUser = generateUser();
  const registerPage = new RegisterPage(page);
  const homePage = new HomePage(page);

  await registerPage.goto();
  await registerPage.register(newUser.username, newUser.email, newUser.password);
  await homePage.expectAuthenticatedAs(newUser.username);
});
