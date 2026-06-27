# Playwright E2E Test Suite — Conduit (rola Programmierprobe)

Playwright E2E tests for the [Conduit Angular app](https://github.com/bedoro/conduit) — a Medium.com clone built with Angular 21.

## Quick start

```bash
cp .env.example .env          # create a test account and fill in credentials (see .env.example)
npm install
npx playwright install chromium
npm run test:e2e
```

Requires Node.js ≥ 20 and internet access (tests run against `https://api.realworld.show`).

## Documentation

- **[NOTES.md](NOTES.md)** — test plan, architecture decisions, bugs found, and KI-Einsatz
- **[e2e/README.md](e2e/README.md)** — all available test commands and folder structure
- **[CI-CD.md](CI-CD.md)** — CI/CD concept
- **[CLAUDE.md](CLAUDE.md)** — KI-Transparenz (AI usage documentation)

## What's covered

8 test cases across two Playwright projects (`e2e-guest` / `e2e-auth`):

| TC  | Scenario                                            |
| --- | --------------------------------------------------- |
| TC1 | Login erfolgreich                                   |
| TC2 | Login mit ungültigen Zugangsdaten                   |
| TC3 | Registrierung eines neuen Nutzers                   |
| TC4 | Submit-Button deaktiviert bei leeren Pflichtfeldern |
| TC5 | Artikel erstellen und veröffentlichen               |
| TC6 | Editor erreichbar als eingeloggter Nutzer           |
| TC7 | Editor leitet nicht-eingeloggte Nutzer weiter       |
| TC8 | Artikel löschen leitet zur Startseite weiter        |
