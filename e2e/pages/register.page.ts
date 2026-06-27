// Page Object für /register — Selektoren und Interaktionsmethoden KI-generiert; Assertion-Methoden menschlich.
import { Locator, Page, expect } from '@playwright/test';

export class RegisterPage {
  private readonly usernameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('input[name="username"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  /**
   * Navigiert zur Registrierungsseite.
   */
  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  /**
   * Füllt das Registrierungsformular aus und sendet es ab.
   *
   * @param username - Gewünschter Benutzername
   * @param email - E-Mail-Adresse
   * @param password - Passwort
   */
  async register(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /* Assertions */

  /**
   * Prüft, dass der Submit-Button deaktiviert ist (Angular-Formvalidierung greift).
   */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }
}
