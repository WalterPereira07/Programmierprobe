# NOTES

## Zeitaufwand

|                 |                          |
| --------------- | ------------------------ |
| **Geplant**     | 2 Stunden                |
| **Tatsächlich** | ca. 4 Stunden 41 Minuten |

Die Überschreitung war eine bewusste Entscheidung, keine unerwartete.

Die ersten 2 Stunden deckten den Pflichtteil vollständig ab: Testplan, Page Objects, alle 8 Testfälle, Konfiguration und grundlegende Dokumentation. Die zusätzliche Zeit wurde für zwei Bereiche genutzt, die ich als Senior für unverzichtbar halte:

**Infrastruktur-Probleme lösen statt umgehen:** Das öffentliche Backend verhielt sich nicht spec-konform (kein Eindeutigkeits-Enforcement, Rate Limiting unter Last). Die Angular-Startup-Race-Condition mit `provideAppInitializer` hätte ich mit einem `waitForTimeout()` kaschieren können — das habe ich bewusst abgelehnt. Stattdessen wurde die Ursache im Quellcode analysiert und mit `fixtures.ts` sauber gelöst.

**Qualität, die im Review auffällt:** Manuelle Bug-Analyse des Angular-Quellcodes, Allure-Reporting, konsistente Dateibenennungskonvention und vollständige Entscheidungsdokumentation. Das ist der Unterschied zwischen einer Lösung, die funktioniert, und einer Lösung, die ein Team übernehmen kann.

Bei striktem 2-Stunden-Limit hätte ich `fixtures.ts` weggelassen und TC5/TC6/TC8 als "flaky gegen öffentliches Backend" markiert, Allure und die Bug-Analyse gestrichen und die Dokumentation auf das Minimum reduziert. Die Tests wären korrekt, aber die Suite weniger produktionsreif.

---

## Setup

```bash
cp .env.example .env          # TEST_USER_EMAIL / TEST_USER_PASSWORD / TEST_USER_USERNAME eintragen
npm install
npx playwright install chromium
npm run test:e2e
```

Die App verbindet sich mit `https://api.realworld.show` — Internetzugang erforderlich.  
Test-Konto einmalig unter https://demo.realworld.show/#/register anlegen und Zugangsdaten in `.env` eintragen.

---

## Testplan

### Gewählte Flows

**Flow 1 — Authentifizierung (Login + Registrierung)**  
Höchstes Risiko: Alles andere setzt funktionierendes Login voraus. Ein kaputtes Login blockiert alle Features für alle Nutzer.

**Flow 2 — Artikel erstellen**  
Kernfunktion der App; testet außerdem das Auth-Guard-Verhalten (Weiterleitung bei nicht eingeloggten Nutzern).

### Was ich teste

| TC  | Szenario                                             | Warum                                                                             |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| TC1 | Erfolgreiches Login                                  | Happy Path; prüft, ob JWT konsumiert wird und die Nav aktualisiert                |
| TC2 | Login mit falschen Zugangsdaten                      | Fehlermeldung muss erscheinen (kein stilles Versagen)                             |
| TC3 | Registrierung eines neuen Nutzers                    | Einziger Onboarding-Pfad                                                          |
| TC4 | Submit-Button bei leeren Feldern deaktiviert         | Prüft Angular-Formvalidierung (API erzwingt keine Eindeutigkeit — siehe Annahmen) |
| TC5 | Artikel veröffentlichen und auf Artikel-Seite landen | End-to-End-Inhaltserstellung                                                      |
| TC6 | Editor erreichbar als eingeloggter Nutzer            | Bestätigt, dass Route Guard den Happy Path erlaubt                                |
| TC7 | Editor leitet nicht-eingeloggte Nutzer weiter        | Guards dürfen nicht umgehbar sein                                                 |
| TC8 | Artikel löschen leitet zur Startseite weiter         | Vollständiger Artikel-Lebenszyklus: erstellen → verifizieren → löschen            |

### Was ich bewusst weglasse

- **Kommentare** — geringeres Risiko; setzt Auth und Navigation (bereits getestet) voraus
- **Favoriten / Following** — benötigt zwei separate Konten; hoher Setup-Aufwand
- **Profilseite** — überwiegend lesend, keine kritische Geschäftslogik
- **Paginierung** — rein präsentational
- **Einstellungen / Passwort** — würde das geteilte Test-Konto verändern; kein einfacher Teardown auf öffentlicher API

### Risikopriorisierung

Auth wird zuerst getestet, weil eine stille Auth-Regression in CI alle nachgelagerten Tests bricht.  
Artikel-Erstellung kommt danach als primärer Schreibpfad der App.  
Rein lesende Flows werden deprioritisiert.

---

## Wichtigste Entscheidungen

**Page Object Model (POM)**  
Selektoren zentralisiert. Bei Template-Änderungen muss nur das POM angepasst werden.

**API-basiertes Auth-Setup ([`global.setup.ts`](e2e/global.setup.ts))**  
Login via direktem API-POST ist ~10× schneller als UI-Login in jedem Test. Das `storageState` wird im Playwright-Projekt `e2e-auth` wiederverwendet. Gast-Tests laufen im separaten Projekt `e2e-guest` ohne storageState — kein manuelles `test.use()`-Override nötig.

**Zwei Playwright-Projekte (`e2e-guest` / `e2e-auth`)**  
Dateien mit `.guest.spec.ts` laufen im Projekt `e2e-guest` (kein Auth-State). Dateien mit `.auth.spec.ts` laufen im Projekt `e2e-auth` (JWT aus [`global.setup.ts`](e2e/global.setup.ts), `dependencies: ['setup']`). Die Projektzuordnung erfolgt über `testMatch: /\.guest\.spec\.ts$/` bzw. `testMatch: /\.auth\.spec\.ts$/` — neue Tests landen automatisch im richtigen Projekt, nur durch korrekte Benennung.

**Allure-Reporting**  
Neben dem Playwright-eigenen HTML-Report ist `allure-playwright` als Reporter eingebunden. Nach einem Testlauf erzeugt `npm run allure:report` einen Allure-Report mit Trendverlauf, Schrittdetails und kategorisierten Fehlern. Die generierten Ordner `allure-results/` und `allure-report/` sind gitignored.

**SlowMo für visuelle Testbeobachtung**  
Im Headed-Modus wird `SLOWMO=500` automatisch gesetzt (`npm run test:e2e:headed`), was jeden Browser-Schritt um 500 ms verlangsamt. Der Wert wird via `launchOptions.slowMo` übergeben und ist im Headless-Modus (CI) deaktiviert.

**Timestamp-basierte Test-Daten**  
Artikel-Titel und Registrierungs-E-Mails enthalten `Date.now()`, um Slug-/Eindeutigkeitskonflikte auf dem öffentlichen Backend zwischen Runs zu vermeiden.

**Selektor-Strategie**  
`name`-Attribute an Formular-Inputs sind stabil und semantisch aussagekräftig. `nav.navbar` statt `nav`, weil die Seite zwei `<nav>`-Elemente enthält (Hauptnavigation und Artikellisten-Paginierung).

**Auth-Fixtures für TC5, TC6, TC8 ([`e2e/fixtures.ts`](e2e/fixtures.ts)) — Whitebox-Workaround**  
Die Auth-Tests verwenden `e2e/fixtures.ts` statt direkt `@playwright/test`. Die Fixture überschreibt die `page`-Fixture mit einem frischen API-Login, einem `addInitScript` und zwei `page.route()`-Interceptors. Das ist **Whitebox-Testing**: die Lösung setzt Wissen über Angular-Interna voraus — wer die Implementierung ändert, muss die Fixture mitpflegen.

_Problem 1 — Token wird durch TC1 invalidiert:_  
TC1 loggt sich mit denselben Zugangsdaten ein wie das Setup. Das Backend gibt dabei einen neuen Token aus und invalidiert den alten. Bei sequenziellem Ausführen (`--workers=1`) läuft TC1 immer vor TC5/TC8 — der in `storageState` gespeicherte Token ist dann ungültig. Bei 4 Workern laufen TC1 und TC5 parallel, weshalb TC5 meistens gewinnt und der Token noch gültig ist.  
Lösung: Die Fixture holt sich bei jedem Auth-Test einen frischen Token via Login-API-Call.

_Problem 2 — `GET /user` schlägt fehl:_  
Angular ruft `GET /user` via `provideAppInitializer` beim Start auf. Gibt das öffentliche Backend 401 zurück, löscht Angular den Auth-State und leitet zu `/login` weiter.  
Lösung: `GET /user` wird abgefangen und gibt die frischen Nutzerdaten aus dem Login-Call zurück.

_Problem 3 — Token fehlt oder ist veraltet im Authorization-Header:_  
`page.goto()` löst beim Browser-`load`-Event auf — Angulars `provideAppInitializer` läuft aber asynchron danach weiter. Außerdem kann `storageState` noch den alten (invalidieren) Token enthalten.  
Lösung: `addInitScript` überschreibt den Token in `localStorage` vor Angular's Start. Zusätzlich werden `POST/DELETE /articles**` abgefangen und der frische Token wird immer gesetzt.

Die tatsächliche Login-Logik wird weiterhin in den Gast-Tests TC1 und TC2 gegen das echte Backend getestet.

**Doppelter "Delete Article"-Button (TC8)**  
Das Angular-Template rendert `app-article-meta` zweimal auf der Artikel-Detailseite — einmal im `.banner` (oben) und einmal in `.article-actions` (unten). Dadurch entstehen zwei identische Delete-Buttons, was zu einem Strict-Mode-Fehler in Playwright führt (`resolved to 2 elements`). Gelöst mit `getByRole('button', { name: 'Delete Article' }).first()` — Playwright selbst schlug diesen Selektor im Fehlerlog vor. Idealerweise würde man hier `data-testid`-Attribute in den Angular-Templates setzen (z. B. `data-testid="delete-article-btn"`), damit Selektoren nicht von der DOM-Struktur abhängen — siehe "Was ich mit mehr Zeit gemacht hätte".

**Einzelner Browser (Chromium)**  
Cross-Browser-Abdeckung ist wertvoll, aber außerhalb des 2-Stunden-Rahmens. Chromium deckt die häufigste Nutzerbasis ab.

---

## Annahmen

- Das öffentliche Backend erzwingt **keine** E-Mail- oder Benutzernamen-Eindeutigkeit — ein geplanter Negativtest für doppelte E-Mails funktionierte nicht. Stattdessen: Test auf deaktivierten Submit-Button bei leeren Feldern.
- Unter hoher Parallelität (>4 Worker) gibt das Backend gelegentlich 401 bei `POST /articles` zurück (Flakiness durch geteilte API). Lösung: `workers: 4` in `playwright.config.ts`.
- Im Headed-Modus (`npm run test:e2e:headed`) läuft die Suite mit `--workers=1` — verhindert, dass mehrere Browser gleichzeitig `POST /articles` absetzen und das Backend mit "token is missing" antwortet. Headed-Modus ist zum Beobachten einzelner Tests gedacht, nicht für parallele Ausführung.
- Der Token wird nicht als Standard-JWT gespeichert, sondern als `token_<hex>` im `localStorage['jwtToken']`.

---

## Was ich mit mehr Zeit gemacht hätte

- **`data-testid`-Attribute in den Angular-Templates** einbauen — eliminiert Abhängigkeit von `name`/`placeholder`-Selektoren
- **Teardown:** Test-Artikel nach jedem Test via API löschen, um das Backend sauber zu halten
- **API-Mocking** mit `page.route()` für fehleranfällige Pfade (Netzwerkfehler, langsame Antworten) — Integration-Tests für Happy Paths, Mocks für Fehlerzustände
- **Weitere Negativfälle:** leeres Formular abschicken, ungültiges E-Mail-Format, zu kurzes Passwort
- **Visual Regression:** Screenshot-Baselines für Schlüsselseiten mit `expect(page).toHaveScreenshot()`
- **Playwright Fixtures** statt `new XxxPage(page)` in jedem Test — reduziert Boilerplate und macht Setup deklarativ
- **`BasePage`-Klasse** als gemeinsame Basis für alle Page Objects — `expect(this.page).toHaveURL(...)` ist aktuell in vier Page Objects dupliziert; eine `BasePage` mit einem zentralen `expectUrl(path)`-Helper würde das eliminieren. Darüber hinaus könnten Assertions, die seitenübergreifend relevant sind (z. B. Auth-Navbar-Zustand prüfen), in der `BasePage` definiert und von `LoginPage`, `EditorPage` und anderen geerbt werden, statt in einem eigenen `HomePage`-Objekt zu leben
- **Cross-Browser-Tests:** aktuell läuft die Suite nur auf Chromium. Mit mehr Zeit würden Firefox und WebKit (Safari) als zusätzliche Playwright-Projekte ergänzt — besonders relevant für CSS-Rendering und Browser-spezifisches Verhalten bei Formularvalidierung und `localStorage`
- **Bessere Selektoren:** `getByRole` / `getByLabel` / `getByPlaceholder` statt `input[name="..."]` — setzt voraus, dass die App `<label>`-Elemente für Formularfelder ergänzt bekommt, was gleichzeitig die Accessibility verbessern würde
- **Vollständige CI/CD-Pipeline** — Konzept in [`CI-CD.md`](CI-CD.md)

---

## Gefundene Bugs (manuelle Tests)

Im Rahmen manueller Tests wurden drei Bugs im Angular-Quellcode identifiziert, die durch E2E-Automatisierung auffindbar wären. Die bestehenden Tests decken diese Fälle aktuell **nicht** ab — sie sind hier als bekannte offene Punkte dokumentiert.

| #   | Datei                                                                                     | Bug                                                                       | Auswirkung                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| B1  | [`article.component.html`](src/app/features/article/pages/article/article.component.html) | `[ngClass]="{ disabled: isDeleting() }"` ohne `[disabled]="isDeleting()"` | CSS sieht deaktiviert aus, aber der Button ist klickbar — Doppelklick sendet zwei `DELETE`-Anfragen                        |
| B2  | [`article.component.ts`](src/app/features/article/pages/article/article.component.ts)     | `deleteArticle()` hat kein `error`-Callback in der `subscribe()`-Pipeline | Bei einem Serverfehler bleibt `isDeleting()` auf `true` — der Button ist dauerhaft visuell deaktiviert, ohne Fehlermeldung |
| B3  | [`auth.component.html`](src/app/core/auth/auth.component.html)                            | `<input type="text" name="email">` statt `type="email"`                   | Browser-seitige E-Mail-Validierung und mobile Keyboards greifen nicht                                                      |

### Reproduktionsschritte

**B1 — Delete-Button nicht wirklich deaktiviert**

1. Einloggen und zu einem eigenen Artikel navigieren
2. DevTools öffnen → **Network**-Tab → Throttle auf **Slow 3G** setzen
3. **Delete Article** klicken
4. Sofort **nochmals klicken**, bevor die Seite weiterleitet
5. Im Network-Tab erscheinen zwei `DELETE`-Anfragen auf denselben Slug — die zweite mit Status `(canceled)`, weil die Seite nach dem ersten Erfolg weitergeleitet hat

**B2 — Kein Error-Handler bei fehlgeschlagenem Löschen**

1. Einloggen und zu einem eigenen Artikel navigieren
2. DevTools → **Network**-Tab öffnen
3. Einen bestehenden Request rechtsklicken → **Block request URL** → Slug-Muster eintragen (z. B. `/articles/mein-artikel-slug`)
4. **Delete Article** klicken — der Button wird grau (`isDeleting()` = true), aber es erscheint **keine Fehlermeldung** und der Button bleibt dauerhaft deaktiviert
5. URL-Blocking wieder entfernen, um den Normalzustand herzustellen

**B3 — E-Mail-Feld hat `type="text"` statt `type="email"`**

1. `/login` oder `/register` aufrufen
2. E-Mail-Eingabefeld rechtsklicken → **Inspect Element**
3. Im HTML sieht man `type="text"` statt `type="email"` — Browser-seitige Format-Validierung greift nicht, und auf mobilen Geräten erscheint keine E-Mail-optimierte Tastatur

---

### Wie man diese Bugs automatisiert prüfen würde

- **B1:** `expect(button).toHaveAttribute('disabled')` nach Klick — oder Doppelklick und prüfen, ob genau eine `DELETE`-Anfrage abgesetzt wurde.
- **B2:** `page.route()` mockt `DELETE /articles/:slug` auf Status 500; Test prüft, ob eine Fehlermeldung erscheint und der Button wieder klickbar ist.
- **B3:** `expect(emailInput).toHaveAttribute('type', 'email')` in TC1 oder TC3 — ein-Zeiler.

Diese Tests würden aktuell **fehlschlagen** (Bugs bestehen), wären aber der korrekte nächste Schritt um die Regressionssicherheit zu erhöhen.

---

## KI-Einsatz

Diese Lösung wurde mit **Claude Code (Claude Sonnet 4.6)** als Pair-Programming-Assistent entwickelt.

Die Kennzeichnung erfolgt auf zwei Ebenen:

- **Dateiebene** (`// [KI-unterstützt]`): Dateien, bei denen der gesamte Inhalt KI-assistiert ist (z. B. `fixtures.ts`, `global.setup.ts`, Testdateien)
- **Abschnittsebene** (Datei-Header + `/* Assertions */`-Trennlinie): Page Objects kennzeichnen explizit, welche Teile KI-generiert sind (Selektoren, Interaktionsmethoden) und welche menschlich entworfen wurden (Assertion-Methoden)

Vollständige Übersicht: [`CLAUDE.md`](CLAUDE.md).
