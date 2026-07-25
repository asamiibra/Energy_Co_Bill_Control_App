# Bill Control Interview Demo Runbook

## Before the Call

- [ ] Restart the browser and close unnecessary tabs.
- [ ] Disable notifications and confirm screen-sharing permission.
- [ ] Open `artifacts/prototype-url.txt` and verify the final HTTPS URL.
- [ ] Scan `artifacts/prototype-qr.png` from the laptop screen.
- [ ] Open presentation mode and press `Shift + D`, then **Reset prototype**.
- [ ] Confirm Baseline Forecast loads with no demo utility visible.
- [ ] Open `artifacts/interview-fallback/` in Finder.
- [ ] Confirm internet access and keep the local production build available.
- [ ] Use 100% browser zoom.

## Opening — 10 Seconds

> This is a synthetic, interactive prototype of Bill Control. I will show a
> normal forecast, a material change, and a case where the safety policy
> suppresses a recommendation.

Start at the presentation-mode Baseline Forecast URL.

## Baseline Forecast — 25 Seconds

1. Point to the `$178` expected bill and `$171–$204` expected range.
2. Show the three approved drivers.
3. Select **Save this action**, then **Save Action Plan**.
4. Point to the confirmation that no automatic change occurred.
5. Point to the read-only disclosure.
6. Press `2` to advance.

## Material-Change Alert — 30 Seconds

1. Show the previous `$164` and revised `$186` estimates.
2. Show the revised `$168–$204` range.
3. Explain the two missing meter days and 18% usage variance.
4. Select an action, then show **Save selected actions** and **Modify**.
5. Emphasize that this is a different August billing cycle.
6. Press `3` to advance.

## Safety Guardrail — 20 Seconds

1. Identify Jordan Lee as a separate winter customer.
2. Show customer-declared essential-use protection.
3. Show that heating reduction is suppressed with no savings amount.
4. Point to the advisor and support paths.

## Close — 5 Seconds

> The first test is comprehension and readiness. Retention lift and causal net
> value are tested in the controlled MVP pilot.

## Keyboard Controls

- `1`: Baseline Forecast in presentation mode.
- `2`: Material-Change Alert in presentation mode.
- `3`: Safety Guardrail in presentation mode.
- `Shift + D`: Toggle the interviewer demo utility.
- `Escape`: Close the demo utility or audit viewer.
- **Reset prototype**: Clears only Bill Control local state after confirmation.

## Failure Recovery

### Site Does Not Load

Open the local production build or
`artifacts/interview-fallback/baseline.png`, then continue with the three static
screens without apology-heavy narration.

### Scenario Fails

Use its direct URL from `artifacts/prototype-url.txt`. If needed, reset local
state, then use the matching fallback screenshot.

### Screen Share Is Slow

Stop interacting, open the static screenshots, and narrate the same sequence.

### QR Code Cannot Be Opened

Continue with screen share. Provide the clean URL after the interview only if
requested.

## Closing Boundary

The prototype is intentionally synthetic and read-only. It demonstrates the
customer contract, safety boundary, and evidence path—not a production utility
integration.
