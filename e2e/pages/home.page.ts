// Page Object für / (Startseite) — Selektoren KI-generiert; Assertion-Methoden menschlich.
import { Locator, Page, expect } from '@playwright/test';

export class HomePage {
  private readonly navbar: Locator;
  private readonly yourFeedTab: Locator;

  constructor(private readonly page: Page) {
    // nav.navbar statt nav — Seite hat zwei <nav>-Elemente (Navbar + Paginierung)
    this.navbar = page.locator('nav.navbar');
    this.yourFeedTab = page.getByRole('link', { name: 'Your Feed' });
  }

  /* Assertions */

  /**
   * Prüft, dass der Nutzer eingeloggt auf der Startseite gelandet ist: URL ist /,
   * der Benutzername erscheint in der Navbar und der "Your Feed"-Tab ist sichtbar
   * (wird nur gerendert wenn Angular den JWT verarbeitet hat).
   *
   * @param username - Erwarteter Benutzername in der Hauptnavigation
   */
  async expectAuthenticatedAs(username: string): Promise<void> {
    await expect(this.page).toHaveURL('/');
    await expect(this.navbar).toContainText(username);
    await expect(this.yourFeedTab).toBeVisible();
  }

  /**
   * Prüft, dass zur Startseite weitergeleitet wurde.
   */
  async expectRedirectedHere(): Promise<void> {
    await expect(this.page).toHaveURL('/');
  }
}
