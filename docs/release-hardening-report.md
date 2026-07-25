# Bill Control Release Hardening Report

## Verdict

**READY FOR FINAL RED-TEAM WITH NON-BLOCKING RISKS**

Release-hardening scope is complete. The public build, direct routes, P0 actions,
resilience states, reset behavior, QR code, screenshots, and interview fallback
package are verified. No critical or high-severity defect remains open.

## Release Identity

- Release date: July 25, 2026
- Public site: `https://bill-control-mvp.ahmdsomy.chatgpt.site`
- Presentation entry:
  `https://bill-control-mvp.ahmdsomy.chatgpt.site/?scenario=baseline&presentation=true`
- Deployment provider: OpenAI Sites on Cloudflare Workers
- Sites project: `appgprj_6a652efe97e88191a1d1134392868349`
- Production version: 5
- Deployment source commit: `bc6910ed3b622c72b64144b47d61215fabd2a876`
- Branch: `main`
- Starting source state: no Git repository was present; release hardening
  initialized the repository to provide immutable deployment provenance.
- Runtime: Node.js 24.13.0, npm 11.6.2

## Scope Completed

- Added deterministic presentation mode with hidden demo utilities and P0
  keyboard navigation.
- Added a confirmed, prototype-scoped reset that preserves unrelated browser
  storage.
- Verified all nine direct scenario routes, refresh behavior, unknown-state
  handling, offline-after-load P0 transitions, and local-only actions.
- Added six-viewport responsive coverage, release artifact assertions, and a
  three-browser deployed smoke matrix.
- Made server initialization Cloudflare-safe by deferring UUID generation until
  browser runtime use.
- Made fixture dates deterministic across server, Chromium, and WebKit by
  formatting explicit UTC values without environment-dependent ICU output.
- Generated deployed-build screenshots, a decoded QR code, the interview
  runbook, technical recovery guide, and a complete offline fallback package.

## Verification Results

| Gate                       | Result                                                       |
| -------------------------- | ------------------------------------------------------------ |
| Clean install              | Passed; 0 audit vulnerabilities                              |
| TypeScript                 | Passed                                                       |
| ESLint                     | Passed                                                       |
| Prettier                   | Passed                                                       |
| Fixture validation         | Passed                                                       |
| Unit and component tests   | 61 passed                                                    |
| E2E behavior               | 88 passed, 54 intentional WebKit responsive skips            |
| Automated accessibility    | 18 passed                                                    |
| Visual regression          | 15 passed, 15 intentional WebKit visual skips                |
| Responsive matrix          | 54 checks across nine states and six viewports               |
| Deployed smoke             | 36 passed across Chromium, WebKit, and Pixel 7; zero retries |
| QR and fallback validation | Passed; QR decodes to the exact presentation URL             |
| Dependency audit           | Passed; 0 known vulnerabilities                              |

The final pre-release suite ran in approximately 87 seconds before the hosting
fixes. The final release command repeats the complete suite, regenerates
fallbacks from the deployed URL, validates the package, and runs deployed smoke.
The completed final release run passed in 150.03 seconds.

## Deployment Evidence

- Access mode is public and requires no authentication.
- All nine presentation routes return HTTP 200 and survive refresh.
- Canonical customer values and the synthetic-data notice render in production.
- Browser smoke covers Chromium, WebKit, and a Pixel 7 profile.
- No application console error, hydration warning, or page exception remains.
- Production screenshots were regenerated directly against the final public URL.

## Resolved Release Defects

1. The initial Worker package generated a session UUID in module global scope,
   which Cloudflare rejected. Session creation is now lazy and regression-tested.
2. The hosting adapter exposed SSR/client query-state and time-zone differences
   as React hydration warnings. Server-resolved route state and deterministic UTC
   formatting eliminate the mismatches.
3. Generated hosting output was initially inside the lint boundary. Build output
   is now ignored without weakening source lint coverage.
4. Early hosting dependency versions produced audit findings. Updated deployment
   dependencies return zero known vulnerabilities.
5. Deployed smoke selectors had stale interaction labels. The tests now exercise
   the actual cold-start refinement, forecast-miss acknowledgment, and consent
   revocation flows with zero retries.

## Performance and Reliability

- Next.js production compilation completes in roughly 2.2–2.8 seconds.
- The five vinext build phases complete in roughly 1.7–1.9 seconds.
- Route transitions use bundled scenario data and do not require a network
  round-trip after initial load.
- P0 scenario switching and local save/audit behavior remain usable when the
  browser is taken offline after load.
- Fonts and presentation assets are bundled with the release.

## Non-Blocking Risks

- vinext reports the root route as `Unknown` during static classification. The
  route is intentionally dynamic, builds successfully, and passes deployed smoke.
- Test processes emit a Node warning when `NO_COLOR` and `FORCE_COLOR` are both
  inherited. It does not originate from application runtime.
- Playwright WebKit emits a known engine-only `styleMedia` deprecation warning;
  deployed smoke filters that exact browser diagnostic while retaining all
  application warnings and errors.
- Visual pixel baselines are maintained on Chromium; WebKit is covered through
  functional, accessibility, and deployed browser testing.

## Deliverables

- QR: `artifacts/prototype-qr.png`
- URL record: `artifacts/prototype-url.txt`
- Deck screenshots: `artifacts/screenshots/`
- Customer fallback screenshots: `public/fallback/`
- Complete interview package: `artifacts/interview-fallback/`
- Demo runbook: `docs/interview-demo-runbook.md`
- Recovery guide: `docs/technical-recovery.md`
- Release checklist: `docs/release-checklist.md`

## Sign-Off

The release lead may proceed to the separate red-team stage. Release hardening
does not authorize production utility writes: the prototype remains synthetic,
read-only, and local-state-only by design.
