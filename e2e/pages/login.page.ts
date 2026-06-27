// Page Object für /login — Selektoren und Interaktionsmethoden KI-generiert; Assertion-Methoden menschlich.
import { Locator, Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessages = page.locator('.error-messages');
  }

  /**
   * Navigiert zur Login-Seite.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Füllt die Login-Formularfelder aus und klickt auf den Anmeldebutton.
   *
   * @param email - E-Mail-Adresse des Nutzers
   * @param password - Passwort des Nutzers
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /* Assertions */

  /**
   * Prüft, dass der Login fehlgeschlagen ist: Seite bleibt auf /login und die
   * Fehlermeldung enthält den angegebenen Text.
   *
   * @param errorText - Erwarteter Teiltext der API-Fehlermeldung
   */
  async expectLoginFailed(errorText: string): Promise<void> {
    await expect(this.page).toHaveURL('/login');
    await expect(this.errorMessages).toContainText(errorText);
  }
}
