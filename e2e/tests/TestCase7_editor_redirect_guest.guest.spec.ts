import { test } from '@playwright/test';

import { EditorPage } from '../pages/editor.page';

test('testCase7 - Editor leitet nicht-eingeloggte Nutzer zu Login weiter', async ({ page }) => {
  const editor = new EditorPage(page);

  await editor.goto();
  await editor.expectAccessDenied();
});
