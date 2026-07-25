# Bill Control MVP — Pre-Release Engineering Audit

**Audit date:** July 25, 2026  
**Auditor role:** Independent principal engineer and release-quality reviewer  
**Authoritative contract:** `../Bill_Control_MVP_Build_Specification_v3.md`  
**Verdict:** **READY WITH NON-BLOCKING RISKS**

## Executive Verdict

The implementation is structurally correct, internally consistent, fully
exercised by the available automated release gates, and safe to advance to
release hardening. All confirmed critical, high, medium, and low defects found
during this audit were fixed. No critical or high unresolved product defect
remains.

The final product boundary is preserved: all data is synthetic, explanations
are deterministic and ledger-constrained, policy owns suppression, consent
dependencies are enforced in services, saved actions remain local, and neither
P0/P1 nor P2 can execute an external change.

The remaining risks are non-blocking and belong to the explicitly deferred
release-hardening and adversarial-review phases.

## Repository Baseline

| Item                  | Baseline                                                          |
| --------------------- | ----------------------------------------------------------------- |
| Repository            | `bill-control/`                                                   |
| Git branch            | Unavailable; directory is not a Git repository                    |
| Git commit            | Unavailable; directory is not a Git repository                    |
| Starting working tree | Captured from filesystem; no Git diff or provenance was available |
| Package manager       | npm 11.6.2                                                        |
| Lockfile              | `package-lock.json`                                               |
| Runtime               | Node.js 24.13.0; package contract requires Node.js 20.9+          |
| Framework             | Next.js 16.2.12 App Router                                        |
| UI runtime            | React and React DOM 19.2.8                                        |
| Language              | TypeScript 5.9.3, strict mode                                     |
| Validation            | Zod 3.25.76                                                       |
| Unit/component test   | Vitest 4.1.10; React Testing Library 16.3.2                       |
| Browser test          | Playwright 1.62.0; Chromium and WebKit                            |
| Accessibility         | axe-core Playwright 4.12.1                                        |
| Styling               | Tailwind CSS 3.4.19                                               |

### Initial Checks Discovered

- `typecheck`, `lint`, `format:check`, `validate:fixtures`, `test`, `build`
- `test:e2e`, `test:a11y`
- No functional visual suite, comprehensive pre-release command, component
  suite, test runbook, or audit report existed at baseline.
- No dead-code, unused-export, or coverage tool is configured.
- Runtime code requires no environment variables. `CI` only controls Playwright
  retries, workers, and server reuse.

### Initial Failures

- `npm ci`: completed, but dependency audit reported 22 advisories: 1 critical,
  17 high, and 4 moderate.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run format:check`: failed across 44 files.
- `npm run validate:fixtures`: returned success incorrectly while fixture
  contract errors existed.
- `npm test`: 24 of 26 tests passed; schema and date assertions failed.
- `npm run test:e2e` and `npm run test:a11y`: could not start because the
  Next.js 14 dev command used an unsupported Turbopack option.
- `npm run build`: passed.
- No visual baseline existed to compare.

## Final Verification Results

| Command                       | Result                    |                         Duration | Corrective history                                                |
| ----------------------------- | ------------------------- | -------------------------------: | ----------------------------------------------------------------- |
| `npm ci`                      | Pass                      |                          12.18 s | Clean lockfile install; 506 packages audited                      |
| `npm run typecheck`           | Pass                      |              Included in `check` | Domain and React 19 typing corrections                            |
| `npm run lint`                | Pass                      |              Included in `check` | ESLint 9 flat configuration                                       |
| `npm run format:check`        | Pass                      |              Included in `check` | Repository formatted with Prettier                                |
| `npm run validate:fixtures`   | Pass                      |              Included in `check` | Validator and canonical fixture corrections                       |
| `npm test`                    | Pass: 58 tests in 8 files |              Included in `check` | Added contract, service, event, and component cases               |
| `npm run build`               | Pass                      |              Included in `check` | Next.js configuration and supported runtime updated               |
| `npm run test:e2e`            | Pass                      | Included in `verify:pre-release` | Routes, actions, navigation, and 36 responsive combinations       |
| `npm run test:a11y`           | Pass: 18 scans            | Included in `verify:pre-release` | Systemic color-contrast defects fixed; no axe suppression         |
| `npm run test:visual`         | Pass: 12 baselines        | Included in `verify:pre-release` | P0 × four viewports; generated images manually reviewed           |
| `npm run verify:pre-release`  | Pass                      |                          91.94 s | Comprehensive release-quality gate                                |
| `npm audit --audit-level=low` | Pass: 0 vulnerabilities   |                           0.75 s | Framework/toolchain upgrades and constrained overrides            |
| `npm find-dupes`              | Review complete           |                      2 s dry-run | Only transitive dedupe suggestions; no blocking runtime duplicate |

The clean install exposed one cache-masked TypeScript issue in the newly added
component test: it depended on implicit Vitest globals. Explicit imports fixed
the test contract, and the complete gate then passed from the clean install.

## Requirement Traceability

| Specification requirement               | Implementation                                                                         | Executable test                                                     | Status                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Product name and customer terminology   | `components/`, `data/scenarios/`, canonical presenter templates                        | `tests/unit/canonical-contract.test.ts`                             | Implemented and tested                      |
| All nine stable scenario states         | `data/scenarios/index.ts`, `lib/scenario-router.ts`, `components/scenario-display.tsx` | `tests/e2e/routes.spec.ts`                                          | Implemented and tested                      |
| Canonical P0 values and relationships   | `data/scenarios/baseline-alex.ts`, `alert-alex.ts`, `safety-jordan.ts`                 | `canonical-contract.test.ts`, `fixture-validation.test.ts`          | Implemented and tested                      |
| Canonical P1 values and variants        | `limited-data.ts`, `cold-start.ts`, `forecast-miss.ts`, `consent.ts`                   | `canonical-contract.test.ts`, `fixture-validation.test.ts`          | Implemented and tested                      |
| Canonical P2 terms and assets           | `tariff-preview.ts`, `connected-home-preview.ts`                                       | `canonical-contract.test.ts`, `scenario-display.test.tsx`           | Implemented and tested                      |
| Billing ownership                       | `services/mock-billing-service.ts`                                                     | `canonical-contract.test.ts`                                        | Implemented and tested                      |
| Forecast ownership                      | `services/mock-forecast-service.ts`                                                    | `fixture-validation.test.ts`, evaluator tests                       | Implemented and tested                      |
| Measurement ownership                   | `services/mock-measurement-service.ts`                                                 | `forecast-surprise-evaluator.test.ts`, `canonical-contract.test.ts` | Implemented and tested                      |
| Policy and safety ownership             | `services/mock-policy-service.ts`, `policy-service.ts`                                 | `consent-policy-action.test.ts`, `canonical-contract.test.ts`       | Implemented and tested                      |
| Consent ownership and dependencies      | `services/mock-consent-service.ts`, `domain/consent.ts`                                | `consent-policy-action.test.ts`                                     | Implemented and tested                      |
| Explanation Evidence Ledger             | `services/explanation-evidence-ledger.ts`                                              | `explanation-faithfulness.test.ts`                                  | Implemented and tested                      |
| Explanation faithfulness and fallback   | `explanation-faithfulness-validator.ts`, `explanation-presenter.ts`                    | `explanation-faithfulness.test.ts`, `event-audit.test.ts`           | Implemented and tested                      |
| Read-only action semantics              | `services/action-intent-service.ts`, action UI components                              | `consent-policy-action.test.ts`, `routes.spec.ts`                   | Implemented and tested                      |
| Material-change rule and reasons        | `lib/material-change-evaluator.ts`, `domain/material-change.ts`                        | `material-change-evaluator.test.ts`                                 | Implemented and tested                      |
| Forecast-surprise eligibility           | `lib/forecast-surprise-evaluator.ts`, measurement service                              | `forecast-surprise-evaluator.test.ts`                               | Implemented and tested                      |
| Event schema and required inventory     | `domain/event.ts`, event producers in services/components                              | `event-audit.test.ts`, `routes.spec.ts`                             | Implemented and tested                      |
| Audit ledger and viewer                 | `services/audit-ledger.ts`, `components/audit-viewer.tsx`                              | `event-audit.test.ts`, route event assertions                       | Implemented and tested                      |
| Accessibility                           | Semantic components, modal focus handling, accessible palette                          | `accessibility.spec.ts`; component and route assertions             | Implemented and tested                      |
| Responsive behavior                     | Shared shell and all scenario views                                                    | `responsive.spec.ts`, `visual.spec.ts`                              | Implemented and tested                      |
| Future-preview labeling and suppression | P2 views, policy, typed `futurePreview` contracts                                      | `scenario-display.test.tsx`, `routes.spec.ts`                       | Implemented and tested                      |
| Test requirements and production build  | npm scripts, Vitest, Playwright, axe, snapshots                                        | `npm run verify:pre-release`                                        | Implemented and tested                      |
| Runtime fallback behavior               | Controlled unknown-scenario state and safe explanation fallback                        | `routes.spec.ts`, `explanation-faithfulness.test.ts`                | Implemented and tested                      |
| Static demo fallback assets             | Deferred by this audit's stop condition                                                | None in this phase                                                  | Intentionally deferred to release hardening |

### Specification Reconciliation Note

The specification contains a genuine material-change wording conflict.
Implementation Decisions and the earlier locked rule define the point-change
trigger as absolute **or** relative threshold, while specification section 15.4
uses “greater of.” The direct audit instructions explicitly require
absolute-only and relative-only cases. The implementation follows the locked
OR rule and tests both threshold-only cases. No canonical value was changed.

## Product-State Inventory

All nine customer routes support direct navigation, deep-link load, refresh, and
non-blank rendering. Back/forward synchronization and unknown-query handling
pass. Every route records a scenario ID in the local audit ledger, displays the
synthetic-data notice, and has no captured console error or warning.

The demo switcher groups:

1. 90-Second Demo Path
2. MVP Resilience States
3. Future Previews

It is marked as a demonstration control and hosts the interviewer-only audit
viewer. The viewer is closed by default and absent from visual baselines.

## Defect Register

| ID      | Severity | Affected state         | Defect and root cause                                                                                       | Fix and verification                                                                                                            | Status |
| ------- | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| PRE-001 | Critical | Build/dependencies     | 22 dependency advisories, including one critical, from stale framework/tooling graph                        | Upgraded supported Next/React/test toolchain and constrained vulnerable transitives; `npm audit` reports zero                   | Fixed  |
| PRE-002 | High     | P2                     | Both required future-preview routes and typed contracts were absent                                         | Added canonical fixtures, schemas, views, router/switcher wiring, component and E2E tests                                       | Fixed  |
| PRE-003 | High     | Browser quality        | E2E and accessibility suites could not start under the installed Next.js version                            | Corrected framework/scripts and production-server Playwright configuration; Chromium/WebKit suites pass                         | Fixed  |
| PRE-004 | High     | Baseline/alert actions | Several controls were inert and action status did not consistently prove non-execution                      | Wired local intent, modify, decline, reminder/advisor semantics and disclosures; unit/E2E boundaries pass                       | Fixed  |
| PRE-005 | High     | All explanations       | Validator covered only a subset of approved facts and unsafe claims                                         | Added exhaustive numeric, driver, policy, consent, tariff, asset, telemetry, transfer, and execution checks plus fallback audit | Fixed  |
| PRE-006 | High     | Consent/safety/P2      | Consent transitions and policy dependencies were display-heavy and incompletely versioned                   | Added typed grant/decline/revoke/restore transitions, previous-state preservation, policy enforcement, and tests                | Fixed  |
| PRE-007 | Medium   | P1/forecast miss       | Date, communication-status, and benefit schemas rejected valid canonical states or permitted ambiguity      | Corrected typed contracts and fixtures; fixture validation and schema tests pass                                                | Fixed  |
| PRE-008 | Medium   | Alert/miss evaluators  | Threshold-only material changes and forecast-surprise eligibility/miss amounts were insufficiently enforced | Expanded evaluators and edge-case suites for every required case                                                                | Fixed  |
| PRE-009 | Medium   | Architecture           | Required Measurement Service was absent, leaving ownership incomplete                                       | Added fixture-backed measurement boundary and tests proving UI consumes its result                                              | Fixed  |
| PRE-010 | Medium   | Instrumentation        | Required events, deduplication, malformed-storage handling, and viewer classification were incomplete       | Expanded event schema/producers, robust local ledger, once-only recording, and audit viewer                                     | Fixed  |
| PRE-011 | Medium   | All screens            | axe found systemic color-contrast failures on all nine routes in both browsers                              | Corrected central palette; 18 scans pass with no ignored axe rule                                                               | Fixed  |
| PRE-012 | Medium   | All screens            | Shared mobile header forced 487–502px content at a 390px viewport                                           | Made controls and trust strip responsive; all 36 state/viewport combinations pass                                               | Fixed  |
| PRE-013 | Medium   | Test system            | Component, all-state responsive, visual-regression, and complete pre-release categories were missing        | Added suites, 12 reviewed snapshots, and `verify:pre-release`                                                                   | Fixed  |
| PRE-014 | Medium   | Runtime copy           | Canonical numbers were duplicated in message/action templates                                               | Derived customer values from fixtures/evidence and added contract searches/assertions                                           | Fixed  |
| PRE-015 | Low      | Repository quality     | Formatting and operational documentation were stale or missing                                              | Formatted repository; updated README/architecture; added testing runbook and audit                                              | Fixed  |

**Defects found:** 1 critical, 5 high, 8 medium, 1 low.  
**Defects fixed:** 15 of 15.  
**Open defects:** 0.

## Test Inventory

| Category                  | Inventory                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Domain/schema and fixture | Canonical cross-state contracts and executable fixture validation                                                       |
| Service boundary          | Billing/forecast/measurement ownership, policy, consent, action intent                                                  |
| Material change           | Below threshold, absolute-only, relative-only, width-only, quality-only, recommendation-only, safety-only, simultaneous |
| Forecast surprise         | Upper/lower, endpoints, inside, superseded, withdrawn, late communication, ineligible, mid-cycle                        |
| Explanation               | Golden P0 outputs plus all required rejection and safe-fallback cases                                                   |
| Events/audit              | Envelope, required names, dedupe, malformed/failing storage, failure metadata                                           |
| Unit/component            | 58 passing tests across 8 files                                                                                         |
| Route/E2E                 | Nine routes in Chromium/WebKit, refresh, history, errors, action boundaries                                             |
| Responsive                | Nine states × four required viewports in Chromium                                                                       |
| Accessibility             | Nine states × Chromium/WebKit; 18 axe scans, no suppression                                                             |
| Visual                    | Three P0 states × four required viewports; 12 reviewed baselines                                                        |
| Production build          | Next.js optimized production build inside `check`                                                                       |
| Coverage                  | No percentage tool configured; contract behavior was prioritized as required                                            |

## Manual and Runtime Review

- Reviewed all 12 generated visual baselines rather than accepting them blindly.
- Confirmed expected bill, range, change explanation, safe next action, future
  banner, synthetic notice, and safety message remain visible.
- Inspected modal dialog semantics, labels, Escape behavior, focus restoration,
  status regions, text alternatives, and color-independent copy.
- Browser automation captures console warnings/errors and page errors on every
  route; none remain.
- No image, font, live API, database, credential, or analytics dependency is
  required by the release artifact.
- No full VoiceOver/NVDA session was performed in this pre-release audit; it is
  retained as a release-hardening manual acceptance check.

## Remaining Risks

### Prompt 5 — Release Hardening

- Create and rehearse the specification's static demo fallback assets.
- Perform final deployment, offline/cache, and production-hosting checks.
- Run full manual VoiceOver and keyboard walkthroughs on representative devices.
- Package final screenshots and conduct final brand/detail polish.
- Confirm stakeholder demo timing and recovery procedure.

### Prompt 6 — Adversarial Red Team

- Attempt consent, policy, explanation-ledger, and local-storage bypasses.
- Fuzz malformed scenario/event/action payloads and hostile customer copy.
- Exercise abuse, privacy, misleading-claim, and cross-state contamination cases.

### Intentionally Out of Scope

- Authentication/authorization, production utility APIs, real consent writes,
  production messaging, payments, tariff switching, thermostat/device control,
  partner transfer, live telemetry, live GenAI, databases, and monitoring.

## Final Sign-Off Checklist

- [x] All nine states load through stable URLs.
- [x] All canonical values and cross-state relationships are correct.
- [x] Fixture validation passes.
- [x] No customer component calculates authoritative values.
- [x] No explanation bypasses the Evidence Ledger.
- [x] No write-enabled or externally executable action exists.
- [x] Safety suppression is deterministic, typed, versioned, and auditable.
- [x] Consent dependencies and transitions work.
- [x] Forecast revision and forecast surprise remain distinct.
- [x] All automated tests pass.
- [x] Accessibility gates pass without suppression.
- [x] Visual-regression gates pass after manual baseline review.
- [x] Production build passes.
- [x] Dependency audit reports zero vulnerabilities.
- [x] No critical or high unresolved defect remains.

## Final Run Record

- `npm ci`: 12.18 seconds; 506 packages audited; 0 vulnerabilities.
- `npm run check`: passed type checking, ESLint, Prettier, fixture validation,
  58 unit/component tests in 8 files, and the optimized static production build.
- `npm run test:e2e`: 64 passed and 36 intentionally skipped WebKit-only
  responsive duplicates; all route flows ran in Chromium and WebKit, and all 36
  responsive combinations ran in Chromium.
- `npm run test:a11y`: 18 of 18 passed in Chromium and WebKit.
- `npm run test:visual`: 12 of 12 Chromium comparisons passed; 12 WebKit cases
  intentionally skipped because baselines are Chromium-scoped.
- `npm run verify:pre-release`: completed successfully in 91.94 seconds.
- `npm audit --audit-level=low`: 0 vulnerabilities in 0.75 seconds.

**Release decision:** Prompt 5 may safely begin.
