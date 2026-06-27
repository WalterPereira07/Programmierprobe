import { test } from '@playwright/test';

import { RegisterPage } from '../pages/register.page';

test('testCase4 - Submit-Button deaktiviert bei leeren Pflichtfeldern', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  // Das öffentliche Demo-Backend erzwingt keine E-Mail-/Nutzernamen-Eindeutigkeit —
  // clientseitige Angular-Formvalidierung wird stattdessen geprüft.
  await registerPage.expectSubmitDisabled();
});
