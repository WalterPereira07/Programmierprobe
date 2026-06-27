# E2E Tests — Conduit

## Voraussetzungen

```bash
cp .env.example .env   # Zugangsdaten eintragen
npm install
npx playwright install chromium
```

---

## Tests ausführen

### Alle Tests

```bash
npm run test:e2e
```

### Einzelnen Test ausführen

```bash
npm run test:e2e:headed -- e2e/tests/TestCase1_login_success.guest.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase2_login_invalid_credentials.guest.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase3_register_new_user.guest.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase4_register_submit_disabled.guest.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase5_article_create.auth.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase6_editor_accessible.auth.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase7_editor_redirect_guest.guest.spec.ts
npm run test:e2e:headed -- e2e/tests/TestCase8_article_delete.auth.spec.ts
```

### Alle Tests sequenziell (einen nach dem anderen)

```bash
npm run test:e2e:headed -- --workers=1
```

### Interaktive UI (Tests einzeln anklicken & beobachten)

```bash
npm run test:e2e:ui
```

### Debug-Modus (Schritt für Schritt)

```bash
npm run test:e2e:debug -- e2e/tests/TestCase1_login_success.guest.spec.ts
```

### HTML-Report anzeigen (nach einem Lauf)

```bash
npm run test:e2e:report
```

### Allure-Report generieren und öffnen

```bash
npm run allure:report
```

> Voraussetzung: Tests wurden vorher mit `npm run test:e2e` ausgeführt (schreibt `allure-results/`).  
> Der Allure-Report zeigt Trendverlauf, Schrittdetails und kategorisierte Fehler.

---

## Testübersicht

| Datei                                               | Beschreibung                                        | Projekt   |
| --------------------------------------------------- | --------------------------------------------------- | --------- |
| `TestCase1_login_success.guest.spec.ts`             | Login erfolgreich                                   | e2e-guest |
| `TestCase2_login_invalid_credentials.guest.spec.ts` | Login mit ungültigen Zugangsdaten                   | e2e-guest |
| `TestCase3_register_new_user.guest.spec.ts`         | Registrierung eines neuen Nutzers                   | e2e-guest |
| `TestCase4_register_submit_disabled.guest.spec.ts`  | Submit-Button deaktiviert bei leeren Pflichtfeldern | e2e-guest |
| `TestCase5_article_create.auth.spec.ts`             | Artikel erstellen und veröffentlichen               | e2e-auth  |
| `TestCase6_editor_accessible.auth.spec.ts`          | Editor erreichbar als eingeloggter Nutzer           | e2e-auth  |
| `TestCase7_editor_redirect_guest.guest.spec.ts`     | Editor leitet nicht-eingeloggte Nutzer weiter       | e2e-guest |
| `TestCase8_article_delete.auth.spec.ts`             | Artikel löschen leitet zur Startseite weiter        | e2e-auth  |

---

## Ordnerstruktur

```
e2e/
├── .auth/              ← gespeicherter Auth-State (gitignored)
│   └── user.json       ← storageState (localStorage mit JWT)
├── pages/              ← Page Objects
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── editor.page.ts
│   └── article.page.ts
├── tests/              ← TestCaseN_beschreibung.guest.spec.ts / .auth.spec.ts
│   ├── TestCase1_login_success.guest.spec.ts
│   ├── TestCase2_login_invalid_credentials.guest.spec.ts
│   ├── TestCase3_register_new_user.guest.spec.ts
│   ├── TestCase4_register_submit_disabled.guest.spec.ts
│   ├── TestCase5_article_create.auth.spec.ts
│   ├── TestCase6_editor_accessible.auth.spec.ts
│   ├── TestCase7_editor_redirect_guest.guest.spec.ts
│   └── TestCase8_article_delete.auth.spec.ts
├── fixtures.ts         ← Custom Playwright-Fixture für Auth-Tests (GET /user Mock + Token-Fallback)
├── global.setup.ts     ← Auth-Setup (läuft einmal vor allen Tests)
├── test-data.ts        ← zentrale Testdaten & Generatoren
├── tsconfig.json       ← TypeScript-Konfiguration für e2e
└── README.md           ← diese Datei
```
