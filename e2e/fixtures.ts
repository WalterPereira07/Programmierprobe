// [KI-unterstützt] Playwright-Fixture für Auth-Tests.
import { test as base } from '@playwright/test';

import { API_BASE, testUser } from './test-data';

/*
 * Überschreibt die page-Fixture für Auth-Tests.
 *
 * Drei Probleme, drei Lösungen:
 *
 * Problem 1 — Gespeicherter Token wird durch TC1 (Login-Test) invalidiert:
 * TC1 loggt sich mit denselben Zugangsdaten ein wie das Setup. Das Backend gibt
 * dabei einen neuen Token aus und invalidiert den alten. Bei sequenziellem
 * Ausführen (--workers=1) läuft TC1 vor TC5/TC8 — der in storageState gespeicherte
 * Token ist danach ungültig. Bei 4 Workern laufen TC1 und TC5 parallel, weshalb
 * TC5 den Wettkampf meistens gewinnt und der Token noch gültig ist.
 * Lösung: Die Fixture holt sich bei jedem Auth-Test einen frischen Token via Login-API.
 *
 * Problem 2 — GET /user schlägt fehl:
 * Angular ruft bei jedem Seitenaufruf GET /user auf (provideAppInitializer),
 * um den JWT zu validieren. Gibt das öffentliche Backend 401 zurück (Rate Limit,
 * Netzwerkfehler), löscht Angular den Auth-State und leitet zu /login weiter.
 * Lösung: GET /user wird abgefangen und gibt die frischen Nutzerdaten zurück.
 *
 * Problem 3 — Token fehlt oder ist veraltet im Authorization-Header:
 * Angular's provideAppInitializer läuft asynchron NACH dem load-Event ab.
 * page.goto() löst beim load-Event auf — der Test kann also POST /articles
 * auslösen bevor setAuth() den frischen Token in localStorage gespeichert hat.
 * Außerdem könnte storageState noch den alten Token enthalten.
 * Lösung: addInitScript überschreibt den Token im localStorage vor Angular's Start.
 * Zusätzlich werden POST/DELETE /articles abgefangen und der frische Token gesetzt.
 */
export const test = base.extend({
  page: async ({ page, request }, use) => {
    // Frischer Login-Token bei jedem Auth-Test — verhindert Invalidierung durch TC1
    const loginRes = await request.post(`${API_BASE}/users/login`, {
      data: { user: { email: testUser.email, password: testUser.password } },
    });
    if (!loginRes.ok()) {
      throw new Error(`Fixture login failed (${loginRes.status()}): ${await loginRes.text()}`);
    }
    const { user } = await loginRes.json();
    const token = user.token as string;

    // Problem 3a: storageState überschreiben — Angular liest beim Start localStorage
    await page.addInitScript((freshToken: string) => {
      window.localStorage.setItem('jwtToken', freshToken);
    }, token);

    // Problem 2: GET /user mock — Angular's Startup-Check mit frischen Nutzerdaten
    await page.route(`${API_BASE}/user`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      }),
    );

    // Problem 3b: Frischen Token in alle Artikel-API-Anfragen injizieren
    await page.route(`${API_BASE}/articles**`, async route => {
      const headers = route.request().headers();
      await route.continue({
        headers: { ...headers, authorization: `Token ${token}` },
      });
    });

    await use(page);
  },
});
