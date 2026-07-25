# Bill Control Final Red-Team Audit

## Executive Verdict

**APPROVED WITH NON-BLOCKING LOW/MEDIUM RISKS**

The final adversarial audit found no open critical or high defect. All confirmed
in-scope defects were fixed and regression-tested. The application remains a
synthetic, read-only prototype with no utility-system, device, payment,
messaging, partner, analytics, database, or live-model integration.

## Entry Gate and Release Identity

- Entry verdict: `READY FOR FINAL RED-TEAM WITH NON-BLOCKING RISKS`
- Branch: `main`
- Baseline source commit: `f8a4a05694585f38d520fb786a088b262ceed842`
- Baseline deployed source: `bc6910ed3b622c72b64144b47d61215fabd2a876`
- Baseline production version: 5
- Final production version: 7
- Final deployed source: `21ab3f000f72cc7c7691a13977cd52e715397a82`
- Public URL: `https://bill-control-mvp.ahmdsomy.chatgpt.site`
- Node/npm: 24.13.0 / 11.6.2
- pnpm: not installed; lockfile-equivalent execution used `npm ci`
- Framework: Next.js 16.2.12
- Browser engines: Playwright Chromium 1234 and WebKit 2336; Pixel 7 Chromium
- Firefox: not configured or installed; no Firefox result is claimed
- Lockfile SHA-256:
  `b49aab5eb0d26e7bdf2c53d4ee6e54118b3fa9b792cee1d57736caf1beb064ef`
- Baseline tree: clean before evidence capture; final-audit evidence then became
  the only untracked content
- Baseline evidence: `artifacts/final-audit/baseline/`

Previously documented non-blocking risks remain: vinext labels the dynamic root
route `Unknown`; inherited `NO_COLOR`/`FORCE_COLOR` produces a test-process
warning; WebKit has a filtered engine-only `styleMedia` warning in deployed
smoke; pixel baselines are Chromium-scoped.

## Scope Tested

- Routes: `/`, empty, nine stable scenario routes, presentation variants, and
  hostile/unknown query values.
- Browsers: Chromium, WebKit/Safari-equivalent, mobile Chromium; deployed
  Edge-equivalent behavior is represented by the Chromium engine.
- Viewports: 1440×900, 1280×720, 1024×768, 430×932, 390×844, 375×667,
  320×568; 200% text scaling and reduced motion.
- State: clean, persisted, malformed storage, reset, rapid history transitions,
  offline-after-load, modal, switcher, audit viewer, consent mutation, and
  expanded permission detail.
- Artifacts: fallback PNGs, deck PNGs, QR, URL records, interview package,
  runbook, recovery guide, release checklist, and visual baselines.
- Security: dependency audit, static external-execution scan, inert-control
  scan, hostile query encoding, malformed local storage, secret/file scan, and
  production network/console capture.

## Feature Test Matrix

| Feature/control                | Implementation                         | Executable verification                      | Result |
| ------------------------------ | -------------------------------------- | -------------------------------------------- | ------ |
| Shell, header, trust chips     | `components/app-shell.tsx`             | routes, responsive, a11y, red-team E2E       | Pass   |
| Help/account controls          | `components/app-shell.tsx`             | local-only feedback E2E, static button audit | Pass   |
| Synthetic notice               | `components/synthetic-data-notice.tsx` | all-route E2E, visuals, artifact generator   | Pass   |
| Message previews/navigation    | `components/message-previews.tsx`      | route and history E2E                        | Pass   |
| Forecast/range/alternatives    | forecast components and fixtures       | canonical unit, route, a11y, visual          | Pass   |
| Driver/explanation drawers     | scenario views, evidence ledger        | faithfulness unit, E2E, a11y                 | Pass   |
| Save/modify/decline            | modal, alert view, intent service      | service unit and action E2E                  | Pass   |
| Reminder/advisor flows         | local feedback hook and views          | red-team E2E and event/storage assertions    | Pass   |
| Safety support options         | safety view and policy service         | policy unit, bypass/action E2E               | Pass   |
| Consent grant/revoke/restore   | consent view/service                   | transition unit, route/a11y E2E              | Pass   |
| Privacy support controls       | consent view                           | local-only red-team E2E                      | Pass   |
| Cold-start refinement          | cold-start fixtures/view               | canonical unit, route, responsive E2E        | Pass   |
| Forecast-miss acknowledgment   | measurement/evaluator/view             | boundary unit and event E2E                  | Pass   |
| Tariff preview                 | P2 fixture/view/policy                 | canonical/component/route/a11y E2E           | Pass   |
| Connected-home preview         | P2 fixture/view/policy                 | canonical/component/route/a11y E2E           | Pass   |
| Demo switcher/shortcuts        | `components/demo-switcher.tsx`         | release-hardening E2E                        | Pass   |
| Audit viewer                   | `components/audit-viewer.tsx`          | event unit, modal/a11y/offline E2E           | Pass   |
| Presentation mode              | shell and router                       | P0 release E2E, deployed smoke, visuals      | Pass   |
| Reset/persistence              | prototype storage and services         | reset/offline/malformed-storage E2E          | Pass   |
| Unknown route/error state      | shell/error boundary/router            | hostile route and a11y E2E                   | Pass   |
| Local-storage failure handling | ledger, intent service, hook           | unit and malformed-storage E2E               | Pass   |
| Static fallback/QR/URLs        | generation/validation scripts          | artifact validator and manual review         | Pass   |
| Build/deployment boundary      | Next/vinext/Sites config               | builds, static audit, deployed smoke         | Pass   |

Every customer button is also scanned by `scripts/final-canonical-audit.mjs`;
the audit fails if a button lacks an explicit handler or customer code contains
an external execution primitive.

## Defect Register

| ID      | Severity | Feature/scenario                   | Reproduction and root cause                                                                                         | Fix                                                                                                    | Regression                                             | Status |
| ------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| FRT-001 | High     | Shared actions, baseline/P1/safety | Numerous prominent buttons had no handler; display implementation outran interaction wiring                         | Added local-only reminder, decline, advisor, support, privacy, and shell outcomes with truthful status | `final-red-team.spec.ts`; canonical inert-button audit | Fixed  |
| FRT-002 | High     | Deck/fallback screenshots          | `.focus-visible` applied rings permanently rather than only during keyboard focus, producing contaminated captures  | Scoped styling to `:focus-visible`; regenerated reviewed visual baselines and release artifacts        | focus-state E2E and visual suite                       | Fixed  |
| FRT-003 | Medium   | Consent at 320×568                 | Permission title, badge, and disclosure competed in a non-wrapping row                                              | Added wrapping and `min-w-0`                                                                           | seven-viewport responsive matrix                       | Fixed  |
| FRT-004 | Medium   | Forecast-miss/audit                | Acknowledge changed UI state without the required audit event                                                       | Emits `forecast_miss_acknowledged` with local-only boundary metadata                                   | red-team event assertion                               | Fixed  |
| FRT-005 | Medium   | Safety/audit                       | Support selection and safety-state view events were missing                                                         | Added typed safety/support/advisor events                                                              | red-team interaction and event assertions              | Fixed  |
| FRT-006 | Medium   | Release gate                       | Newly preserved audit evidence was included in Prettier scanning, breaking format/check/release gates               | Added generated-evidence exclusions in `.prettierignore`                                               | final formatting and `verify:final`                    | Fixed  |
| FRT-007 | Low      | Documentation paths                | Authoritative contract and decisions live at the case-root parent while historical repo docs refer to that location | Final report records physical source-of-truth location; no duplicate authority created                 | documentation audit                                    | Closed |

## Canonical-Data Verification

- Baseline: Alex Morgan; July 25, 2026; August 2 close; 8 days; $128.36
  to date; $178 point; $171–$204 range; `FCST-ALEX-20260725-01`; three
  approved drivers; 2°F/seven-day action; $12–$18; Low; self-directed.
- Alert: Alex Morgan; August 25, 2026; September 2 close; 8 days; 18%
  variance; two missing days; $164/$154–$181 to $186/$168–$204;
  August 21 and August 25 versions/timestamps. Searches found no stale
  $166–$199, revised-$181, or prior-$178 claim.
- Safety: Jordan Lee; winter; customer-declared essential use;
  `POLICY-JORDAN-ESSENTIAL-001`; suppress; no savings amount or bypass.
- Limited data: $176; $153–$211; 9 days; limited; monthly read;
  limited-but-actionable; $5–$15. The not-actionable policy branch is unit
  tested.
- Cold start: Taylor Brooks; $165/$125–$218 initial; approved 3-person,
  heat-pump, EV, smart-thermostat refinement to $172/$142–$205.
- Forecast miss: $174/$160–$192 communicated range; $207 final; upper miss;
  $15 beyond range; four days before close.
- Tariff: Standard Flex $2,160–$2,340; Saver Time-of-Use $2,010–$2,220;
  $90–$240 potential; 12 months; $75 exit fee.
- Connected home: EV yes; smart thermostat yes; solar/battery no;
  connected-device access not requested; partner referral declined.

Fixture validation, canonical contract tests, screenshot assertions, and
fallback generation all consume these locked values; customer components do not
authoritatively calculate them.

## Safety and Governance Verification

- Read-only boundary: no `fetch`, XHR, WebSocket, beacon, external form action,
  production endpoint, analytics SDK, live model, or write integration exists.
- Policy ownership: suppression is service/fixture-owned and cannot be
  overridden by the explanation or local saved-state path.
- Consent dependencies: purpose-specific grant/decline/revoke/restore behavior
  and P2 suppression are unit/component/E2E tested.
- Explanation faithfulness: evidence-ledger allow-list and safe fallback reject
  unsupported numbers, drivers, policy, consent, tariff, telemetry, and
  execution claims.
- Future actions: tariff switching, device control, referrals, and live
  telemetry remain visibly unavailable and non-actionable.
- Safety bypass attempts through query, storage corruption, history cycling,
  stale intent, and action selection fail closed.

## Accessibility Verification

- Axe: 22/22 dynamic and normal-state scans passed in Chromium and WebKit with
  no rule suppression.
- Dynamic coverage: modal, demo switcher, audit viewer, expanded consent and
  mutated consent state.
- Keyboard: presentation shortcuts, Escape closing, focus entry/restoration,
  button activation, and focus-visible behavior passed.
- Responsive/accessibility: 320px reflow, 200% text scaling, reduced motion,
  status regions, range alternatives, dialog/table semantics, and synthetic
  notice passed.
- Manual limitation: no full VoiceOver/NVDA spoken-output session or physical
  device lab was available. This remains a non-blocking medium risk because
  semantic and engine-level coverage passes.

## Browser and Viewport Verification

| Target                            | Result                                                 |
| --------------------------------- | ------------------------------------------------------ |
| Chromium desktop                  | All behavior, responsive, a11y, and visual checks pass |
| WebKit/Safari-equivalent          | All behavior and 22 a11y checks pass                   |
| Pixel 7 Chromium                  | Deployed smoke passes                                  |
| Chromium engine / Edge-equivalent | Deployed behavior represented; no separate Edge binary |
| Firefox                           | Not configured; no result claimed                      |
| Seven target viewports            | 63/63 Chromium responsive checks pass                  |

## Artifact Verification

- Customer fallbacks: `public/fallback/{baseline,alert,safety}.png`
- Deck captures: `artifacts/screenshots/{baseline,alert,safety}-deck.png`
- QR: `artifacts/prototype-qr.png`, 768×768, decodes exactly to the HTTPS
  presentation URL with no tracking parameters
- URLs: primary, P0, and presentation URLs validated from both URL files
- Interview package: screenshots, QR, URLs, runbook, and recovery guide present
- Visual baselines: intentionally regenerated only for the corrected focus-state
  defect, then rerun without snapshot updates
- Deck consistency evidence:
  `artifacts/final-audit/deck-prototype-consistency.md`

## Full Command Results

Baseline results and raw logs are preserved in
`artifacts/final-audit/baseline/commands/`. The baseline had four format-derived
failures (`format:check`, `verify:pre-release`, `check`, `verify:release`);
all functional, accessibility, visual, build, artifact, dependency, and deployed
checks otherwise passed.

The final full-gate output is preserved at
`artifacts/final-audit/final/verify-final.log`.

| Command                           | Baseline duration/result | Final result                              |
| --------------------------------- | ------------------------ | ----------------------------------------- |
| `npm ci`                          | 16s, pass                | Pass                                      |
| `npm run typecheck`               | 2s, pass                 | Pass                                      |
| `npm run lint`                    | 4s, pass                 | Pass                                      |
| `npm run format:check`            | 3s, fail; evidence scope | Pass after FRT-006                        |
| `npm run validate:fixtures`       | <1s, pass                | Pass                                      |
| `npm test`                        | 5s, 61 pass              | 61 pass                                   |
| `npm run test:e2e`                | 38s, pass                | 131 pass, 63 intentional responsive skips |
| `npm run test:a11y`               | 27s, 18 pass             | 22 pass                                   |
| `npm run test:visual`             | 17s, 15 pass             | 15 pass, 15 engine-scope skips            |
| `npm run build`                   | 8s, pass                 | Pass                                      |
| `npm run generate:fallbacks`      | 12s, pass                | Pass                                      |
| `npm run test:deployed`           | 24s, 36 pass             | Pass after deployment                     |
| `npm run verify:release`          | 7s, format fail          | Pass after remediation                    |
| `npm run build:sites`             | not baseline-run         | Pass                                      |
| `npm audit --audit-level=low`     | pass, zero findings      | Pass                                      |
| `npm run audit:final`             | new                      | Pass                                      |
| `BASE_URL=… npm run verify:final` | new                      | Pass in 106s                              |

No retries are configured for local runs. Deployed smoke runs with zero retries.
The inherited color-variable warning is non-application output and no test
required a rerun to pass.

## Remaining Risks

- Medium: no full spoken screen-reader session or real-device browser lab was
  available; automated semantic, keyboard, WebKit, and mobile emulation pass.
- Low: Firefox and a distinct Microsoft Edge binary are not configured; Chromium
  and WebKit plus deployed mobile Chromium pass.
- Low: vinext dynamic-route classification and inherited color-variable warnings
  remain build/test-tool diagnostics, not application runtime failures.
- Low: no full strategic deck source is present, so consistency is limited to
  repository product captures.

## Final Release Sign-Off

- [x] All nine states load directly, refresh, and render in presentation mode.
- [x] Every visible feature and hidden demo control has an executable check.
- [x] All canonical values and cross-state relationships are correct.
- [x] No stale product/canonical copy remains in runtime or artifacts.
- [x] No write-enabled action or external execution primitive exists.
- [x] Safety, consent, and explanation faithfulness fail closed.
- [x] Material-change and forecast-surprise boundary suites pass.
- [x] Events are correlated, locally traceable, and malformed-storage tolerant.
- [x] Reset and presentation mode pass online and offline-after-load.
- [x] Accessibility, responsive, browser, visual, artifact, QR, and fallback
      gates pass within the declared environment.
- [x] Deployment routes pass with no application console or network failures.
- [x] No critical or high defect remains.

**Final release authority:** approved for Bain interview use with only the
explicit non-blocking risks above.
