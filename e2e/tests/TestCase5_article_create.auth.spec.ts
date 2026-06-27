import { test } from '../fixtures';

import { ArticlePage } from '../pages/article.page';
import { EditorPage } from '../pages/editor.page';
import { generateArticle } from '../test-data';

// Läuft mit vorher authentifiziertem State aus global.setup.ts.

test('testCase5 - Artikel erstellen und veröffentlichen', async ({ page }) => {
  const article = generateArticle();
  const editor = new EditorPage(page);

  await editor.createAndPublish(article);

  const articlePage = new ArticlePage(page);
  await articlePage.expectTitle(article.title);
  await articlePage.expectBodyContains(article.body);
  await articlePage.expectTagVisible(article.tag);
});
