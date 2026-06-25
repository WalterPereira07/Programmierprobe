# End-to-end tests

Place your Playwright tests in this folder.

The setup here is deliberately bare — a single starter smoke test
(`example.spec.ts`) and a minimal `playwright.config.ts` in the project
root. Designing the structure (page objects, fixtures, test data,
helpers, ...) is part of the exercise. See `TASK.md` in the project root.

The app exposes a small debug interface on `window.__conduit_debug__`
(defined in `src/app/app.config.ts`) which you may use if helpful.
