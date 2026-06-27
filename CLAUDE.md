# CLAUDE.md — KI-Transparenz

Diese Datei dokumentiert, wo und wie **Claude Code (Claude Sonnet 4.6)** bei dieser Programmierprobe eingesetzt wurde.

## Kennzeichnung

Die Kennzeichnung erfolgt auf zwei Ebenen:

- **Dateiebene** (`// [KI-unterstützt]`): Dateien, bei denen der gesamte Inhalt KI-assistiert ist (`fixtures.ts`, `global.setup.ts`, Testdateien, `test-data.ts`, `playwright.config.ts`)
- **Abschnittsebene**: Page Objects tragen im Datei-Header eine explizite Beschreibung des Splits (z. B. _„Selektoren und Interaktionsmethoden KI-generiert; Assertion-Methoden menschlich"_). Innerhalb der Klasse markiert ein `/* Assertions */`-Trennkommentar, ab wo die menschlich entworfenen Methoden beginnen.

## Überblick: Was hat die KI beigetragen?

| Datei                                                         | KI-Rolle                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `e2e/global.setup.ts`                                         | Struktur generiert; API-Shape und Token-Injection vom Menschen geprüft                                                               |
| `e2e/fixtures.ts`                                             | Whitebox-Fixture generiert; Entscheidung für diesen Ansatz und Akzeptanz der Whitebox-Natur vom Menschen                             |
| `e2e/pages/login.page.ts`                                     | Selektoren und `login()`-Methode KI-generiert; `expectLoginFailed()` menschlich entworfen                                            |
| `e2e/pages/register.page.ts`                                  | Selektoren und `register()`-Methode KI-generiert; `expectSubmitDisabled()` menschlich entworfen                                      |
| `e2e/pages/editor.page.ts`                                    | Selektoren und Interaktionsmethoden KI-generiert; `createAndPublish()` und Assertion-Methoden menschlich entworfen                   |
| `e2e/pages/article.page.ts`                                   | Selektoren KI-generiert; Assertion-Methoden menschlich; `.first()`-Fix für doppelten Delete-Button vom Menschen                      |
| `e2e/pages/home.page.ts`                                      | Neu erstellt; Selektoren KI-generiert; `expectAuthenticatedAs()` menschlich — Entscheidung für „Your Feed" als stärksten Auth-Signal |
| `e2e/tests/TestCase1_login_success.guest.spec.ts`             | Struktur assistiert; Teststrategie vom Menschen entschieden                                                                          |
| `e2e/tests/TestCase2_login_invalid_credentials.guest.spec.ts` | Struktur assistiert; Fehlermeldungstext gegen echte API verifiziert                                                                  |
| `e2e/tests/TestCase3_register_new_user.guest.spec.ts`         | Struktur assistiert; Teststrategie vom Menschen entschieden                                                                          |
| `e2e/tests/TestCase4_register_submit_disabled.guest.spec.ts`  | Struktur assistiert; Testfall wegen fehlender Backend-Eindeutigkeit umformuliert                                                     |
| `e2e/tests/TestCase5_article_create.auth.spec.ts`             | Struktur assistiert; Teststrategie vom Menschen entschieden                                                                          |
| `e2e/tests/TestCase6_editor_accessible.auth.spec.ts`          | Struktur assistiert; Teststrategie vom Menschen entschieden                                                                          |
| `e2e/tests/TestCase7_editor_redirect_guest.guest.spec.ts`     | Vereinfacht durch Zwei-Projekt-Split; kein Browser-Context-Overhead mehr                                                             |
| `e2e/tests/TestCase8_article_delete.auth.spec.ts`             | Generiert; Testidee und Lifecycle-Strategie vom Menschen entschieden                                                                 |
| `e2e/test-data.ts`                                            | Generiert; Timestamp-Strategie vom Menschen entschieden                                                                              |
| `playwright.config.ts`                                        | Zwei-Projekt-Split und SlowMo vorgeschlagen; vom Menschen geprüft und genehmigt                                                      |
| `NOTES.md`                                                    | KI-assistiert formatiert; alle strategischen Entscheidungen sind menschlich                                                          |
| `CI-CD.md`                                                    | KI-generiertes Konzeptdokument                                                                                                       |
| `CLAUDE.md`                                                   | KI-generiert                                                                                                                         |

## Was die KI NICHT entschieden hat

- **Welche Flows getestet werden** — menschliche Entscheidung (Auth als höchstes Risiko, Artikel-Erstellung als Kernfunktion)
- **Was bewusst weggelassen wird und warum** — menschliches Urteil über Risiko-/Aufwandsabwägungen
- **Selektor-Wahl** — Mensch hat Angular-Templates gelesen und jeden Selektor verifiziert
- **Timestamp-basierte Datenstrategie** — menschliche Entscheidung, Teardown-Komplexität auf öffentlicher API zu vermeiden
- **Zwei-Playwright-Projekt-Split** — Mensch hat entschieden, Gast- und Auth-Tests in separate Projekte (`e2e-guest` / `e2e-auth`) zu trennen statt `test.use()`-Overrides zu verwenden
- **Worker-Begrenzung auf 4** — aus eigener Flakiness-Analyse gewonnen, nicht von KI vorgeschlagen
- **Erkenntnis zur E-Mail-Eindeutigkeit** — aus direktem API-Test gewonnen
- **Allure-Reporting** — Mensch hat entschieden, Allure als zweiten Reporter neben dem Playwright-HTML-Report einzubinden, um Trendverlauf und kategorisierte Fehler zu erhalten
- **Namenskonvention `TestCaseN_beschreibung.guest/auth.spec.ts`** — Mensch hat entschieden, TC-Nummern beizubehalten (bessere Identifizierbarkeit) und Dateiendung statt Regex-Muster für die Projektzuordnung zu nutzen
- **Fixture-Workaround für Auth-Tests** — Mensch hat entschieden, einen gemeinsamen Playwright-Fixture (`fixtures.ts`) statt individueller Workarounds in jedem Test zu verwenden; die Whitebox-Natur wurde bewusst akzeptiert und dokumentiert
- **SlowMo-Wert im Headed-Modus** — Mensch hat 500 ms als sinnvollen Wert für visuelle Beobachtung gewählt; Wert ist per Umgebungsvariable konfigurierbar
- **Manuelle Bug-Analyse** — Mensch hat den Angular-Quellcode auf automatisierbar auffindbare Bugs untersucht und drei Probleme identifiziert (B1: fehlender `[disabled]`, B2: kein Error-Handler, B3: falscher Input-Typ)
- **Entscheidung gegen Bugfix-Tests** — Mensch hat entschieden, die gefundenen Bugs nur zu dokumentieren statt neue Testfälle hinzuzufügen, da diese sofort fehlschlagen würden
- **Assertion-Design in Page Objects** — Mensch hat entschieden, welche Zustände geprüft werden und in welcher Kombination (z. B. `expectAuthenticatedAs` prüft URL + Username + „Your Feed"-Tab; `expectLoginFailed` kombiniert URL-Prüfung mit Fehlermeldung)
- **`createAndPublish()`-Hilfsmethode** — Mensch hat erkannt, dass die Artikel-Erstellungssequenz in TC5 und TC8 dupliziert war, und entschieden, sie im `EditorPage`-Objekt zu zentralisieren

## Wo das menschliche Denken sichtbar wird

Die obige Liste beschreibt Entscheidungen — aber Entscheidungen allein sind leicht zu behaupten. Der eigentliche Beleg findet sich in [`NOTES.md`](NOTES.md), Abschnitt "Wichtigste Entscheidungen":

- Die **Worker-Begrenzung auf 4** entstand aus einer schrittweisen Analyse (1 → 2 → 4 → 8 Worker), nicht aus einem KI-Vorschlag
- Die **Auth-Fixture** deckt drei unabhängig diagnostizierte Ursachen für denselben Fehler ab: Token-Invalidierung durch TC1, Angular-Startup-Race-Condition und Backend-Rate-Limiting — jede durch Lesen des Angular-Quellcodes verifiziert (`provideAppInitializer`, `tokenInterceptor`, `errorInterceptor`)

Diese Entscheidungen sind nicht generiert — sie spiegeln reale Debugging-Sitzungen wider, inklusive falscher Hypothesen und Sackgassen.
