# Bill Control Technical Recovery

## Essential Commands

```bash
npm ci
npm run dev
npm run build
npm run start
npm run generate:fallbacks
BASE_URL=https://example.test npm run test:deployed
BASE_URL=https://example.test npm run verify:release
```

For a complete final recovery verification, run:

```bash
BASE_URL=https://example.test npm run verify:final
```

Local development defaults to `http://localhost:3000`. The final deployment and
direct routes are recorded in `artifacts/prototype-url.txt`.

## Production

- Site: `https://bill-control-mvp.ahmdsomy.chatgpt.site`
- Presentation entry:
  `https://bill-control-mvp.ahmdsomy.chatgpt.site/?scenario=baseline&presentation=true`
- Hosting: OpenAI Sites on Cloudflare Workers
- Access: public, no sign-in required

## Stable Routes

- `/?scenario=baseline`
- `/?scenario=alert`
- `/?scenario=safety`
- `/?scenario=limited-data`
- `/?scenario=cold-start`
- `/?scenario=forecast-miss`
- `/?scenario=consent`
- `/?scenario=tariff-preview`
- `/?scenario=connected-home-preview`
- Presentation: `/?scenario=baseline&presentation=true`

## Recovery

| Symptom                       | Recovery                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------- |
| Public site unavailable       | Start the local production build; otherwise use `artifacts/interview-fallback/` |
| Wrong or stale scenario state | Press `Shift + D`, choose **Reset prototype**, confirm                          |
| Demo utility visible          | Press `Escape`; presentation mode hides its trigger                             |
| Scenario transition fails     | Paste the stable direct URL                                                     |
| Browser cache is stale        | Hard refresh; if necessary clear site data for the Bill Control origin only     |
| Screenshot stale              | Run `npm run generate:fallbacks` after a passing build                          |
| QR stale                      | Run `npm run generate:links -- https://public-url`                              |
| QR validation needed          | Run `npm run validate:release-artifacts`                                        |
| Deployed route concern        | Run `BASE_URL=https://public-url npm run test:deployed`                         |

If a deployed request returns a Cloudflare Worker error, read the recent Sites
Worker logs first. The release build avoids global-scope I/O and UUID generation;
session identifiers are created only during browser runtime use.

## Local State

Reset removes only these prototype keys:

- `bill-control-saved-plans`
- `bill-control-audit-events`
- `bill-control-local-reminders`
- `bill-control-consent-overrides`
- `bill-control-presentation-progress`
- `bill-control-faithfulness-test-state`

It never calls `localStorage.clear()` and never removes unrelated browser data.

## Fallback Locations

- Customer screenshots: `public/fallback/`
- Deck screenshots: `artifacts/screenshots/`
- Complete package: `artifacts/interview-fallback/`

`Shift + D` opens the interviewer utility. `Escape` closes it and the audit
viewer.
