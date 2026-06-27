/* [KI-unterstützt] Zentrale Testdaten — alle Konstanten, Umgebungsvariablen und
Generatoren für Testdaten an einem einzigen Ort. */

// ─── Infrastruktur ────────────────────────────────────────────────────────────

export const API_BASE = 'https://api.realworld.show/api';
export const AUTH_FILE = 'e2e/.auth/user.json';

// ─── Test-Account (aus .env) ──────────────────────────────────────────────────

export const testUser = {
  email: process.env['TEST_USER_EMAIL'] ?? '',
  password: process.env['TEST_USER_PASSWORD'] ?? '',
  username: process.env['TEST_USER_USERNAME'] ?? '',
};

// ─── Ungültige Zugangsdaten (für Negativtests) ────────────────────────────────

export const invalidCredentials = {
  email: 'nobody@example.com',
  password: 'wrong-password',
};

// ─── Generatoren (timestamp-basiert, um Konflikte auf dem geteilten Backend zu vermeiden) ──

export function generateUser() {
  const ts = Date.now();
  return {
    username: `testuser${ts}`,
    email: `testuser${ts}@example.com`,
    password: 'Passw0rd!Test',
  };
}

export function generateArticle() {
  const ts = Date.now();
  return {
    title: `E2E Test Article ${ts}`,
    description: 'Created by Playwright test suite',
    body: 'This article was created automatically by an E2E test.',
    tag: 'playwright-e2e',
  };
}
