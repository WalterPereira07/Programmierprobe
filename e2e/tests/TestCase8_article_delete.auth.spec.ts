import { test } from '../fixtures';

import { ArticlePage } from '../pages/article.page';
import { EditorPage } from '../pages/editor.page';
import { HomePage } from '../pages/home.page';
import { generateArticle } from '../test-data';

// Läuft mit vorher authentifiziertem State aus global.setup.ts.

test('testCase8 - Artikel löschen leitet zur Startseite weiter', async ({ page }) => {
  const article = generateArticle();
  const editor = new EditorPage(page);

  await editor.createAndPublish(article);

  const articlePage = new ArticlePage(page);
  await articlePage.expectTitle(article.title);
  await articlePage.deleteArticle();

  const homePage = new HomePage(page);
  await homePage.expectRedirectedHere();
});
