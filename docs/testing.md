# Testing

## Release Gate

Run the complete pre-release gate from the project root:

```bash
npm ci
npm run verify:pre-release
npm audit
```

`verify:pre-release` runs static checks, fixture validation, unit and component
tests, a production build, browser flows, accessibility checks, and visual
regression.

## Suite Inventory

- `tests/unit/`: domain schemas, canonical contracts, material-change logic,
  forecast-surprise eligibility, consent transitions, policy/action boundaries,
  explanation faithfulness, event envelopes, and storage failure behavior.
- `tests/components/`: scenario routing and representative customer-visible
  boundaries rendered from fixtures.
- `tests/e2e/routes.spec.ts`: all nine direct URLs and refreshes, history,
  controlled unknown state, customer actions, and non-execution guarantees.
- `tests/e2e/responsive.spec.ts`: all nine states at 1440×900, 1280×720,
  1024×768, and 390×844 with horizontal-overflow assertions.
- `tests/e2e/accessibility.spec.ts`: axe scans for all nine states in Chromium
  and WebKit without rule suppression.
- `tests/e2e/visual.spec.ts`: full-page P0 baselines at the four required
  viewports in Chromium.

Playwright builds and serves the production application so browser tests verify
the release artifact rather than development-only behavior.

## Visual Baselines

Update baselines only after intentional UI changes:

```bash
npm run test:visual -- --update-snapshots
```

Review every changed PNG for clipping, overflow, obscured content, unsafe copy,
missing synthetic-data disclosure, and responsive regressions. Then rerun
`npm run test:visual` without the update flag.

## Focused Commands

```bash
npm test -- tests/unit/material-change-evaluator.test.ts
npm test -- tests/components/scenario-display.test.tsx
npm run test:e2e -- tests/e2e/routes.spec.ts
npm run test:a11y
```

Fixture validation is also available independently with
`npm run validate:fixtures`.

## Manual Checks

Before a stakeholder demo, manually confirm:

1. Keyboard-only navigation, visible focus, Escape dismissal, and modal focus
   restoration.
2. Screen-reader reading order and status announcements on representative P0
   and consent flows.
3. The demo switcher remains visibly separate from customer product controls.
4. Saved plans, consent changes, and audit events remain local and disclose that
   no external action occurred.

Release artifacts and deployed checks use:

```bash
npm run generate:fallbacks
BASE_URL=https://public-url npm run test:deployed
BASE_URL=https://public-url npm run verify:release
```
