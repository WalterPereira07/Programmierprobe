# CI/CD-Konzept — Playwright E2E Tests

> Konzept — keine lauffähige Pipeline. Dient als Gesprächsgrundlage.

## Pipeline-Stufen

```
Push / PR → [Lint + Unit-Tests] → [Build] → [E2E-Tests] → [Report]
```

### 1. Lint & Unit-Tests (schnelles Feedback, ~1 Min.)

Läuft bei jedem Push. Blockiert den PR bei Fehlern.

```yaml
- run: npm run format:check
- run: npm test # vitest Unit-Tests
```

### 2. Build (stellt sicher, dass die App kompiliert, bevor E2E läuft)

```yaml
- run: npm run build
```

### 3. E2E-Tests (bei PRs und auf `main`, ~3–5 Min.)

```yaml
- name: Playwright-Browser installieren
  run: npx playwright install --with-deps chromium

- name: E2E-Tests ausführen
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    TEST_USER_USERNAME: ${{ secrets.TEST_USER_USERNAME }}
  run: npm run test:e2e
```

Zugangsdaten werden als CI-Secrets gespeichert — niemals im Repository.

### 4. Report hochladen

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 14
```

Der HTML-Report wird bei jedem Lauf (auch bei Fehlern) als CI-Artefakt hochgeladen, damit Fehler ohne lokalen Nachbau untersucht werden können.

---

## Wann laufen die Tests?

| Auslöser                   | Läuft                                       |
| -------------------------- | ------------------------------------------- |
| Push auf beliebigen Branch | Nur Lint + Unit-Tests (schnell)             |
| PR geöffnet / aktualisiert | Vollständige Pipeline inkl. E2E             |
| Merge auf `main`           | Vollständige Pipeline                       |
| Nächtlicher Schedule       | Vollständige Pipeline (fängt API-Drift auf) |

E2E bei jedem Push wäre zu langsam (~3–5 Min.) für schnelles Feedback. PRs sind der richtige Kompromiss.

---

## Umgang mit Flakiness

**Retries:** `retries: 1` in CI (`playwright.config.ts`) fängt kurze Netzwerkaussetzer beim öffentlichen Backend ab, ohne echte Bugs zu verbergen.

**Keine Retry-Maskierung:** Ein Test, der konsistent mehr als 1 Retry braucht, wird untersucht und behoben — nicht mit mehr Retries ausgestattet. Flakiness ist ein Symptom, keine Test-Eigenschaft.

**Netzwerkfehler-Tests:** Für negative Pfade (API-Fehler, Timeouts) `page.route()` einsetzen, um API-Antworten zu mocken. Das macht diese Tests deterministisch und unabhängig vom Backend.

**Nächtlicher Lauf:** Fängt Regressionen durch Verhaltensänderungen des öffentlichen Backends auf (Schema-Änderungen, Rate Limiting). Ein Fehler auf `main`, der in keinem PR aufgetaucht ist, deutet auf eine Backend-Änderung hin — nicht auf einen Testfehler.

---

## Test-Konto-Management

Das geteilte `TEST_USER_*`-Konto wird nur für Flows genutzt, die seinen Zustand nicht dauerhaft verändern (kein Passwort-Ändern, keine E-Mail-Änderung). Artikel, die im Test erstellt werden, sind auf dem öffentlichen Backend akzeptable Nebeneffekte.

In einer echten Produktionsumgebung würde ich:

- Ein dediziertes CI-Test-Konto anlegen
- Test-Daten via API in `afterEach`/Teardown-Hooks löschen
- Eine private Backend-Instanz für vollständige Isolation nutzen
