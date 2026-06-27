import { test } from '../fixtures';

import { EditorPage } from '../pages/editor.page';

// Läuft mit vorher authentifiziertem State aus global.setup.ts.

test('testCase6 - Editor erreichbar als eingeloggter Nutzer', async ({ page }) => {
  const editor = new EditorPage(page);

  await editor.goto();
  await editor.expectAccessible();
});
