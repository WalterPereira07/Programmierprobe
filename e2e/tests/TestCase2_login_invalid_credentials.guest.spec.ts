import { test } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { invalidCredentials } from '../test-data';

test('testCase2 - Login mit ungültigen Zugangsdaten zeigt Fehlermeldung', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(invalidCredentials.email, invalidCredentials.password);
  // Die RealWorld-API gibt "credentials invalid" zurück
  await loginPage.expectLoginFailed('credentials invalid');
});
