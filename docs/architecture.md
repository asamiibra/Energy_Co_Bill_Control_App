# Bill Control MVP — Architecture

## Overview

The Bill Control MVP implements a **read-only, synthetic prototype** that demonstrates the product's core value proposition: helping energy customers understand expected bills, see transparent ranges, understand changes, and take safe self-directed actions.

## Architecture Principles

### 1. Authoritative Services Own Data

**GenAI may explain and orchestrate; authoritative services remain the source of record.**

All business-critical values (bills, ranges, recommendations, policy decisions) originate from typed mock services that simulate production service boundaries:

- **BillingService** → Bill to date, billing periods, tariff information
- **ForecastService** → Expected bill, range, forecast versions, data quality
- **MeasurementService** → Estimated benefits, final bills, forecast surprise evaluation
- **PolicyService** → Safety decisions, recommendation suppression, eligibility
- **ConsentService** → Permission state, granted/revoked timestamps

### 2. Explanation Evidence Ledger

The **Explanation Evidence Ledger** contains the complete set of approved facts that customer-facing explanations may reference:

```typescript
interface ExplanationEvidenceLedger {
  expectedBill: number;
  expectedRange: { low: number; high: number };
  drivers: ApprovedDriver[];
  recommendations: AvailableRecommendation[];
  policyDecisionId: string;
  // ... complete approved facts only
}
```

**Critical constraints:**

- Immutable for each rendered response
- Explanation code may ONLY reference claims in the ledger
- No invention, recomputation, or alteration permitted
- Factual consistency validation required before display

### 3. Read-Only MVP Boundary

The MVP **saves customer intent** but **never executes external actions**:

✅ **Permitted:**

- Save action plans locally
- Record customer preferences
- Display recommendations and estimates
- Show confirmation modals
- Provide advisor contact options

❌ **Prohibited:**

- Execute thermostat commands
- Change tariffs or accounts
- Process payments or billing adjustments
- Write to systems of record
- Simulate irreversible transactions

## Data Flow

```
[Synthetic Fixtures]
    ↓
[Mock Services] → [Evidence Ledger] → [Explanation Presenter] → [Customer UI]
    ↓                                                               ↓
[Policy Service] ← [Action Intent Service] ← [Customer Actions]
```

## Service Architecture

### Mock Services (Simulate Production Boundaries)

**BillingService**

```typescript
getBillingData(scenario): BillingServiceData
getHouseholdProfile(scenario): HouseholdProfile
getHistoricalBills(customerId): HistoricalBill[]
```

**ForecastService**

```typescript
getCurrentForecast(scenario): ForecastSnapshot
getPreviousForecast(scenario): ForecastSnapshot?
getForecastDrivers(scenario): ForecastDriver[]
generateForecast(customerId, billingEnd): ForecastSnapshot
```

**PolicyService**

```typescript
getSafetyDecision(scenario): SafetyDecision
shouldSuppressRecommendation(rec, safety): boolean
filterRecommendations(scenario): Recommendation[]
```

### Explanation Layer

**Explanation Presenter**

- Uses deterministic templates (no live LLM in MVP)
- Consumes ONLY the Explanation Evidence Ledger
- May vary tone/reading level without changing facts
- Returns safe fallback on validation failure

**Faithfulness Validator**

```typescript
validateExplanationFaithfulness(
  explanation: RenderedExplanation,
  ledger: ExplanationEvidenceLedger
): { isValid: boolean; failedRules: string[] }
```

Validates every numeric claim, driver reference, and recommendation matches the ledger exactly.

### Action Intent Service

Handles customer action plans with **read-only constraints**:

```typescript
saveActionPlan(scenario, customer, recommendations): SavedActionPlan
modifyActionPlan(planId, updates): SavedActionPlan
declineActionPlan(planId): boolean
markActionCompleted(planId): boolean // Self-reported only
```

**Important:** No external execution capability exists in the MVP.

## Evaluation Logic

### Material-Change Evaluation

Determines when forecast revisions trigger customer alerts:

```typescript
type MaterialChangeConfig = {
  absolutePointChangeDollars: 15; // Prototype default
  relativePointChangePercent: 0.08; // 8%
  rangeWidthIncreasePercent: 0.25; // 25%
  alertOnDataQualityDegradation: true;
  alertWhenRecommendationChanges: true;
  alertWhenSafetyStateChanges: true;
};
```

**Alert triggers when ANY condition is met:**

1. Expected bill changes by ≥$15 OR ≥8% of previous bill
2. Range width increases by ≥25%
3. Data quality degrades
4. Recommendation materially changes
5. Safety/suppression state changes

### Forecast-Surprise Evaluation

Measures final bill accuracy **after billing closes**:

```typescript
forecastSurprise = finalBill < range.low || finalBill > range.high;
```

**Eligibility requirements:**

- Range communicated ≥24 hours before billing close
- Range not withdrawn or superseded
- Customer eligible for forecast at communication time
- **Bill equal to endpoints = inside range** (not a surprise)

## Testing Strategy

### Fixture Validation

- Expected bill inside expected range ✓
- Days remaining reconcile with scenario dates ✓
- Forecast versions chronologically valid ✓
- Safety suppression consistent ✓
- Benefit estimates include assumptions ✓

### Business Logic Tests

- Material-change triggers fire correctly ✓
- Forecast-surprise evaluation handles edge cases ✓
- Explanation faithfulness validation catches violations ✓

### Integration Tests

- All nine direct routes and refresh behavior ✓
- Component rendering with fixture data ✓
- Action confirmation without execution ✓
- All nine states at four responsive viewports ✓
- Chromium and WebKit accessibility scans ✓
- P0 visual regression at four viewports ✓

## Technology Stack

**Framework:** Next.js 16 with App Router and React 19  
**Language:** TypeScript with strict mode  
**Styling:** Tailwind CSS  
**Validation:** Zod schemas for all domain models  
**Testing:** Vitest + React Testing Library + Playwright  
**Storage:** Local memory + localStorage (no external dependencies)

The implementation also includes fixture-backed consent and measurement
services, a policy application boundary, a local action-intent service, and an
interviewer-only audit viewer. P2 tariff and connected-home views are typed
future previews and cannot expose executable actions.

## Deployment Architecture

**Build requirements:**

- Static or pre-rendered pages preferred
- No authentication required
- No environment secrets
- No external API dependencies for P0 states
- Offline-like reliability after initial load

**Performance characteristics:**

- Primary demo states load immediately
- Scenario fixtures bundled at build time
- No loading spinners required for canonical states
- Works after network disconnection

## Security & Privacy

**Synthetic data only:**

- No real customer information
- No production utility integration
- No live LLM or model calls
- Clear synthetic data labeling

**Read-only constraints:**

- No write access to billing, tariff, consent, or device systems
- Action Intent Service saves plans locally only
- Audit events stored in memory + localStorage
- No third-party analytics SDKs

## Governance Boundaries

### What the MVP Validates

✅ Customer can understand ranges and drivers  
✅ Material-change alerts work transparently  
✅ Safety suppression protects essential usage  
✅ Action semantics preserve customer control  
✅ Read-only boundary prevents accidental execution

### What Requires Future Implementation

⚠️ Production forecast accuracy and calibration  
⚠️ Live utility API integration  
⚠️ Real authentication and authorization  
⚠️ Governed action execution with approval workflows  
⚠️ Production safety policy and vulnerability detection

The MVP **proves the product concept** while **preserving safety** through read-only constraints and synthetic data.
