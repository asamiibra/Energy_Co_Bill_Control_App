import { DemoScenarioSchema } from '@/domain/scenario';
import { scenarios } from '@/data/scenarios';
import { daysBetween } from './format-date';

export interface ValidationError {
  scenarioId: string;
  rule: string;
  message: string;
}

/**
 * Validate all scenario fixtures against the specification requirements.
 * This runs during tests and production builds to ensure data integrity.
 */
export function validateAllFixtures(): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [key, scenario] of Object.entries(scenarios)) {
    errors.push(...validateScenario(key, scenario));
  }

  // Cross-scenario validations
  errors.push(...validateCrossScenario());

  return errors;
}

function validateScenario(key: string, scenario: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate against Zod schema
  const result = DemoScenarioSchema.safeParse(scenario);
  if (!result.success) {
    result.error.errors.forEach((err) => {
      errors.push({
        scenarioId: key,
        rule: 'schema_validation',
        message: `${err.path.join('.')}: ${err.message}`,
      });
    });
    return errors; // Stop further validation if schema fails
  }

  const s = result.data;

  // Expected bill must fall inside expected range
  if (
    s.forecast.expectedBill < s.forecast.expectedRange.low ||
    s.forecast.expectedBill > s.forecast.expectedRange.high
  ) {
    errors.push({
      scenarioId: key,
      rule: 'expected_bill_inside_range',
      message: `Expected bill ${s.forecast.expectedBill} is outside range [${s.forecast.expectedRange.low}, ${s.forecast.expectedRange.high}]`,
    });
  }

  // Days remaining must match scenario dates
  const calculatedDays = daysBetween(s.anchorDate, s.forecast.billingPeriodEnd);
  if (
    s.forecast.billingStatus !== 'closed' &&
    Math.abs(calculatedDays - s.forecast.daysRemaining) > 1
  ) {
    // Allow 1 day tolerance for date calculation differences
    errors.push({
      scenarioId: key,
      rule: 'days_remaining_reconciliation',
      message: `Days remaining ${s.forecast.daysRemaining} does not match calculated days ${calculatedDays}`,
    });
  }

  // Revised forecast must reference earlier version
  if (s.previousForecast) {
    const prevDate = new Date(s.previousForecast.generatedAt);
    const currDate = new Date(s.forecast.generatedAt);

    if (prevDate >= currDate) {
      errors.push({
        scenarioId: key,
        rule: 'chronological_timestamps',
        message: `Previous forecast timestamp must be before current forecast timestamp`,
      });
    }

    if (s.previousForecast.forecastVersionId === s.forecast.forecastVersionId) {
      errors.push({
        scenarioId: key,
        rule: 'unique_forecast_versions',
        message: `Previous and current forecast versions must differ`,
      });
    }
  }

  // Benefit estimates must include assumptions
  s.recommendations.forEach((rec) => {
    if (rec.benefit && rec.benefit.assumptions.length === 0) {
      errors.push({
        scenarioId: key,
        rule: 'benefit_assumptions_required',
        message: `Recommendation ${rec.recommendationId} has benefit estimate without assumptions`,
      });
    }

    // Suppressed recommendations must not show benefits
    if (rec.status === 'suppressed' && rec.benefit) {
      errors.push({
        scenarioId: key,
        rule: 'suppressed_no_benefit',
        message: `Suppressed recommendation ${rec.recommendationId} must not have benefit estimate`,
      });
    }

    // Future actions must not be marked available
    if (rec.mode === 'future_governed_action' && rec.status === 'available') {
      errors.push({
        scenarioId: key,
        rule: 'future_action_not_available',
        message: `Future governed action ${rec.recommendationId} cannot be marked available in MVP`,
      });
    }
  });

  // Safety scenarios must have policy decision ID
  if (s.safetyDecision.status === 'suppress') {
    if (!s.safetyDecision.policyDecisionId) {
      errors.push({
        scenarioId: key,
        rule: 'safety_policy_decision_id',
        message: `Suppression requires a policy decision ID`,
      });
    }

    // Verify at least one recommendation is suppressed
    const hasSuppressed = s.recommendations.some(
      (r) => r.status === 'suppressed'
    );
    if (!hasSuppressed) {
      errors.push({
        scenarioId: key,
        rule: 'safety_suppression_consistency',
        message: `Safety decision status is 'suppress' but no recommendations are suppressed`,
      });
    }
  }

  return errors;
}

function validateCrossScenario(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Baseline and alert must be different billing cycles
  const baseline = scenarios.baseline;
  const alert = scenarios.alert;

  if (baseline && alert) {
    if (
      baseline.forecast.billingPeriodEnd === alert.forecast.billingPeriodEnd
    ) {
      errors.push({
        scenarioId: 'cross_scenario',
        rule: 'different_billing_cycles',
        message: `Baseline and alert scenarios must represent different billing cycles`,
      });
    }

    // Verify alert has previous forecast
    if (!alert.previousForecast) {
      errors.push({
        scenarioId: 'alert',
        rule: 'alert_has_previous_forecast',
        message: `Alert scenario must have a previousForecast`,
      });
    }
  }

  // Safety scenario must use different customer
  const safety = scenarios.safety;
  if (baseline && safety) {
    if (baseline.household.customerId === safety.household.customerId) {
      errors.push({
        scenarioId: 'safety',
        rule: 'safety_different_customer',
        message: `Safety scenario should use a different customer than baseline`,
      });
    }
  }

  return errors;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Validating scenario fixtures...\n');
  const errors = validateAllFixtures();

  if (errors.length === 0) {
    console.log('✅ All fixtures validated successfully');
    process.exit(0);
  } else {
    console.error('❌ Fixture validation failed:\n');
    errors.forEach((err) => {
      console.error(`[${err.scenarioId}] ${err.rule}: ${err.message}`);
    });
    process.exit(1);
  }
}
