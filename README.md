# Bill Control MVP

Bill Control is a message-first, responsive synthetic prototype that helps energy
customers understand expected bills and ranges, explain material changes, save
safe self-directed intent, and access support. It never changes a thermostat,
tariff, account, payment, or external system.

## Prerequisites

- Node.js 20.9 or later
- npm 11 or later

## Local Development

```bash
npm ci
npm run dev
```

## Vercel deployment

Import the GitHub repository into Vercel with this repository root selected.
The checked-in `vercel.json` uses the Next.js preset, installs from
`package-lock.json` with `npm ci`, and runs `npm run build`. No environment
variables are required for the synthetic, read-only prototype.

Open `http://localhost:3000/demo` for the interview-demo overview.

The application has three explicit modes:

- **Customer mode:** direct scenario URLs without extra query parameters. These
  begin with the message relevant to that customer journey and never expose the
  scenario catalogue or interviewer navigation.
- **Presentation mode:** add `presentation=true`. This opens the selected state
  directly, adds the guided three-step navigation, preserves local state across
  scenarios, and clears state only when **Reset demo** is selected.
- **Screenshot mode:** add `screenshot=true`. This opens the selected customer
  state directly without presentation navigation or technical demo utilities.

The public interview build is
`https://bill-control-mvp.ahmdsomy.chatgpt.site/demo`.

Presentation mode also supports `1`, `2`, and `3` for the P0 path. Press
`Shift + D` to toggle interviewer utilities and `Escape` to close them.

## Demo Scenarios

| State                   | URL                                 |
| ----------------------- | ----------------------------------- |
| Baseline Forecast       | `/?scenario=baseline`               |
| Material-Change Alert   | `/?scenario=alert`                  |
| Safety Guardrail        | `/?scenario=safety`                 |
| Limited-Data Mode       | `/?scenario=limited-data`           |
| New-Customer Cold Start | `/?scenario=cold-start`             |
| Forecast-Miss Recovery  | `/?scenario=forecast-miss`          |
| Consent and Preferences | `/?scenario=consent`                |
| Tariff-Fit Preview      | `/?scenario=tariff-preview`         |
| Connected-Home Preview  | `/?scenario=connected-home-preview` |

The guided presentation sequence uses:

1. `/?scenario=baseline&presentation=true`
2. `/?scenario=alert&presentation=true`
3. `/?scenario=safety&presentation=true`

The `/demo` overview also provides visually secondary links to all P1 and P2
states. Interviewer utilities remain available only in presentation mode.
Unknown scenario IDs render a controlled error state.

## Verification

```bash
npm run verify:pre-release
```

| Command                           | Scope                                                       |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run check`                   | Types, lint, format, fixtures, unit/component tests, build  |
| `npm run test:e2e`                | Chromium, WebKit, and Firefox flows and responsiveness      |
| `npm run test:a11y`               | axe checks for all nine states in all three browser engines |
| `npm run test:visual`             | Chromium P0 and account-menu visual baselines               |
| `npm run generate:fallbacks`      | Generate canonical fallback and deck screenshots            |
| `npm run test:deployed`           | Smoke-test the public `BASE_URL` in desktop/mobile browsers |
| `npm run verify:release`          | Run the complete release and artifact gate                  |
| `BASE_URL=… npm run verify:final` | Run the final canonical, release, deployed, and Sites gate  |
| `npm run validate:fixtures`       | Typed fixture and cross-scenario invariants                 |
| `npm audit`                       | Dependency vulnerability audit                              |

See `docs/testing.md` for suite details and baseline maintenance.

## Architecture

- **Framework:** Next.js 16 App Router, React 19, strict TypeScript
- **UI:** Tailwind CSS and Lucide icons
- **Contracts:** Zod schemas and canonical synthetic fixtures
- **Services:** Fixture-backed billing, forecast, measurement, policy, consent,
  action-intent, explanation, and audit boundaries
- **Storage:** Browser `localStorage` only; malformed state fails safely
- **Testing:** Vitest, React Testing Library, Playwright, and axe-core

Customer-facing values come from typed fixtures or authoritative mock-service
outputs. Deterministic explanations are checked against an evidence ledger
before display, and policy owns recommendation suppression.

## Repository Layout

```text
app/                 Next.js routes and global styles
components/          Shared UI and scenario views
data/scenarios/      Canonical synthetic fixtures
domain/              Zod schemas and TypeScript contracts
services/            Authoritative mock-service boundaries
lib/                 Evaluation, routing, and formatting utilities
tests/               Unit, component, E2E, accessibility, and visual tests
docs/                Architecture, testing, and audit documentation
```

## Prototype Boundaries

- All customer and energy data is synthetic and labeled on every state.
- No authentication, production utility API, third-party analytics, live model,
  or environment secret is required.
- Saved plans and consent changes remain local to the browser.
- Tariff and connected-home concepts are visibly future-only and non-executable.

The authoritative product contract is
`../Bill_Control_MVP_Build_Specification_v3.md`.
