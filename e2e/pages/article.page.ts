// Page Object für /article/:slug — Selektoren und Interaktionsmethoden KI-generiert; Assertion-Methoden menschlich.
import { Locator, Page, expect } from '@playwright/test';

export class ArticlePage {
  private readonly title: Locator;
  private readonly body: Locator;
  private readonly tagList: Locator;
  private readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('.article-page .banner h1');
    this.body = page.locator('.article-content');
    this.tagList = page.locator('.article-content .tag-list');
    // app-article-meta wird zweimal gerendert (Banner + article-actions) → zwei identische Buttons. .first() nimmt den im Banner.
    this.deleteButton = page.getByRole('button', { name: 'Delete Article' }).first();
  }

  /**
   * Klickt auf den "Delete Article"-Button, um den Artikel zu löschen.
   */
  async deleteArticle(): Promise<void> {
    await this.deleteButton.click();
  }

  /* Assertions */

  /**
   * Prüft, ob der Artikeltitel exakt dem erwarteten Wert entspricht.
   *
   * @param title - Erwarteter Titel
   */
  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toHaveText(title);
  }

  /**
   * Prüft, ob der Artikelinhalt den angegebenen Text enthält.
   *
   * @param text - Erwarteter Teiltext im Artikelkörper
   */
  async expectBodyContains(text: string): Promise<void> {
    await expect(this.body).toContainText(text);
  }

  /**
   * Prüft, ob der angegebene Tag im Artikel sichtbar ist.
   *
   * @param tag - Erwarteter Tag
   */
  async expectTagVisible(tag: string): Promise<void> {
    await expect(this.tagList.locator('li', { hasText: tag })).toBeVisible();
  }
}
