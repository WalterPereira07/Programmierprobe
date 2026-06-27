// Page Object für /editor — Selektoren und Interaktionsmethoden KI-generiert; Assertion-Methoden menschlich.
import { Locator, Page, expect } from '@playwright/test';

export class EditorPage {
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly bodyTextarea: Locator;
  private readonly tagInput: Locator;
  private readonly publishButton: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.locator('input[name="title"]');
    this.descriptionInput = page.locator('input[name="description"]');
    this.bodyTextarea = page.locator('textarea[name="body"]');
    this.tagInput = page.locator('input[placeholder="Enter tags"]');
    this.publishButton = page.locator('button', { hasText: 'Publish Article' });
  }

  /**
   * Navigiert zur Editor-Seite (neuer Artikel).
   */
  async goto(): Promise<void> {
    await this.page.goto('/editor');
  }

  /**
   * Füllt die Pflichtfelder des Artikelformulars aus.
   *
   * @param title - Titel des Artikels
   * @param description - Kurzbeschreibung
   * @param body - Hauptinhalt des Artikels
   */
  async fillArticle(title: string, description: string, body: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyTextarea.fill(body);
  }

  /**
   * Gibt einen Tag ein und bestätigt ihn mit Enter.
   *
   * @param tag - Tag-Bezeichnung
   */
  async addTag(tag: string): Promise<void> {
    await this.tagInput.fill(tag);
    await this.tagInput.press('Enter');
  }

  /**
   * Klickt auf den "Publish Article"-Button, um den Artikel zu veröffentlichen.
   */
  async publish(): Promise<void> {
    await this.publishButton.click();
  }

  /**
   * Erstellt einen Artikel vollständig und wartet auf die Weiterleitung zur Detailseite.
   * Fasst goto → fillArticle → addTag → publish → waitForURL zusammen,
   * da diese Sequenz in mehreren Tests (TC5, TC8) identisch benötigt wird.
   *
   * @param article - Artikeldaten mit title, description, body und tag
   */
  async createAndPublish(article: { title: string; description: string; body: string; tag: string }): Promise<void> {
    await this.goto();
    await this.fillArticle(article.title, article.description, article.body);
    await this.addTag(article.tag);
    await this.publish();
    // 15 s für API-Latenz beim öffentlichen geteilten Backend
    await this.page.waitForURL(/\/article\/.+/, { timeout: 15_000 });
  }

  /* Assertions */

  /**
   * Prüft, dass der Editor erreichbar ist: URL bleibt /editor und das Titelfeld ist sichtbar.
   */
  async expectAccessible(): Promise<void> {
    await expect(this.page).toHaveURL('/editor');
    await expect(this.titleInput).toBeVisible();
  }

  /**
   * Prüft, dass der Route Guard den Zugriff verweigert hat und zu /login weitergeleitet wurde,
   * und dass kein Editor-Inhalt gerendert wurde.
   */
  async expectAccessDenied(): Promise<void> {
    await expect(this.page).toHaveURL('/login');
    await expect(this.titleInput).not.toBeVisible();
  }
}
