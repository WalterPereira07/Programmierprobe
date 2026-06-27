/*[KI-unterstützt] Globales Auth-Setup — läuft einmal vor dem e2e-Projekt.
Loggt via RealWorld-API ein, injiziert den JWT in localStorage und speichert
den Browser-Storage-State, damit jeder Test im e2e-Projekt eingeloggt startet.*/
import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { API_BASE, AUTH_FILE } from './test-data';

setup('authenticate test user', async ({ request, page }) => {
  const email = process.env['TEST_USER_EMAIL'];
  const password = process.env['TEST_USER_PASSWORD'];

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD env vars are required. See NOTES.md.');
  }

  const response = await request.post(`${API_BASE}/users/login`, {
    data: { user: { email, password } },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`API login failed (${response.status()}): ${body}`);
  }

  const { user } = await response.json();

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  /*
   * Die App speichert den JWT unter localStorage['jwtToken'].
   * Playwright kann localStorage nur über eine geöffnete Seite schreiben —
   * deshalb wird '/' kurz geöffnet, der Token gesetzt und anschließend der
   * gesamte Browser-Storage-State in e2e/.auth/user.json gespeichert.
   *
   * Die erzeugte Datei sieht so aus:
   * {
   *   "cookies": [],
   *   "origins": [{
   *     "origin": "http://localhost:4200",
   *     "localStorage": [{ "name": "jwtToken", "value": "token_abc123..." }]
   *   }]
   * }
   *
   * Playwright liest diese Datei beim Start jedes e2e-auth-Tests und stellt
   * den localStorage wieder her — der Test startet direkt im eingeloggten Zustand,
   * ohne die Login-Seite aufzurufen.
   *
   * Die Datei ist in .gitignore eingetragen und wird bei jedem Testlauf neu erstellt.
   */
  await page.goto('/');
  await page.evaluate((token: string) => {
    localStorage.setItem('jwtToken', token);
  }, user.token);

  // Sanity check — sicherstellen, dass der Token korrekt in localStorage gespeichert wurde
  const storedToken = await page.evaluate(() => window.localStorage.getItem('jwtToken'));
  if (storedToken !== user.token) {
    throw new Error('Setup failed: localStorage token does not match API token after write');
  }

  await page.context().storageState({ path: AUTH_FILE });
});
