import type { DemoScenario } from '@/domain/scenario';

/**
 * Explanation Evidence Ledger
 *
 * Contains the complete set of approved facts that an explanation may use.
 * The ledger is immutable for a rendered response.
 * Customer-facing explanation code may ONLY reference claims present in this ledger.
 *
 * The explanation layer cannot invent, recompute, adjust, or overwrite these values.
 */
export interface ExplanationEvidenceLedger {
  // Forecast values
  expectedBill: number;
  expectedRange: {
    low: number;
    high: number;
  };
  billToDate: number;
  daysRemaining: number;

  // Previous forecast (for revisions)
  previousExpectedBill?: number;
  previousExpectedRange?: {
    low: number;
    high: number;
  };

  // Version and freshness
  forecastVersionId: string;
  previousForecastVersionId?: string;
  generatedAt: string;
  previousGeneratedAt?: string;

  // Data quality
  dataQualityTier: 'full' | 'limited' | 'insufficient';
  sourceCadence:
    'interval' | 'monthly-read' | 'batch' | 'cohort-based' | 'final-bill';
  missingMeterDays: number;

  // Approved drivers
  drivers: Array<{
    id: string;
    title: string;
    direction: 'up' | 'down' | 'neutral';
    contributionRange?: {
      low: number;
      high: number;
    };
    explanation: string;
    source: string;
  }>;

  // Approved recommendations
  recommendations: Array<{
    recommendationId: string;
    title: string;
    description: string;
    mode: string;
    benefit?: {
      low: number;
      high: number;
      currency: string;
      basis: string;
      assumptions: string[];
      confidenceLabel: string;
    };
    effort: string;
    status: 'available' | 'suppressed' | 'unavailable' | 'future';
  }>;
  allRecommendations: DemoScenario['recommendations'];

  // Policy and safety
  policyDecisionId: string;
  safetyStatus: 'allow' | 'suppress';
  safetyReasonCode: string;
  safetyMessage?: string;
  supportOptions: string[];

  // Consent
  consentVersionId: string;
  consentPermissions: DemoScenario['consentState']['permissions'];

  assets: {
    hasEV?: boolean;
    hasSmartThermostat?: boolean;
    hasSolar?: boolean;
    hasBattery?: boolean;
  };
  futurePreview?: DemoScenario['futurePreview'];

  // Source identifiers
  customerId: string;
  customerName: string;
  scenarioId: string;
  billingPeriodEnd: string;
}

/**
 * Build an immutable evidence ledger from a scenario.
 * This is the ONLY approved source of facts for customer-facing explanations.
 */
export function buildEvidenceLedger(
  scenario: DemoScenario
): ExplanationEvidenceLedger {
  return {
    // Forecast values
    expectedBill: scenario.forecast.expectedBill,
    expectedRange: {
      low: scenario.forecast.expectedRange.low,
      high: scenario.forecast.expectedRange.high,
    },
    billToDate: scenario.forecast.billToDate,
    daysRemaining: scenario.forecast.daysRemaining,

    // Previous forecast
    previousExpectedBill: scenario.previousForecast?.expectedBill,
    previousExpectedRange: scenario.previousForecast?.expectedRange,

    // Version and freshness
    forecastVersionId: scenario.forecast.forecastVersionId,
    previousForecastVersionId: scenario.previousForecast?.forecastVersionId,
    generatedAt: scenario.forecast.generatedAt,
    previousGeneratedAt: scenario.previousForecast?.generatedAt,

    // Data quality
    dataQualityTier: scenario.forecast.dataQualityTier,
    sourceCadence: scenario.forecast.sourceCadence,
    missingMeterDays: scenario.forecast.missingMeterDays,

    // Approved drivers
    drivers: scenario.drivers.map((d) => ({
      id: d.id,
      title: d.title,
      direction: d.direction,
      contributionRange: d.contributionRange,
      explanation: d.explanation,
      source: d.source,
    })),

    // Approved recommendations (only available ones for explanation)
    recommendations: scenario.recommendations
      .filter((r) => r.status === 'available')
      .map((r) => ({
        recommendationId: r.recommendationId,
        title: r.title,
        description: r.description,
        mode: r.mode,
        benefit: r.benefit,
        effort: r.effort,
        status: r.status,
      })),
    allRecommendations: scenario.recommendations,

    // Policy and safety
    policyDecisionId: scenario.safetyDecision.policyDecisionId,
    safetyStatus: scenario.safetyDecision.status,
    safetyReasonCode: scenario.safetyDecision.reasonCode,
    safetyMessage: scenario.safetyDecision.customerMessage,
    supportOptions: scenario.safetyDecision.supportOptions,

    // Consent
    consentVersionId: scenario.consentState.consentVersionId,
    consentPermissions: scenario.consentState.permissions,

    assets: {
      hasEV: scenario.household.hasEV,
      hasSmartThermostat: scenario.household.hasSmartThermostat,
      hasSolar: scenario.household.hasSolar,
      hasBattery: scenario.household.hasBattery,
    },
    futurePreview: scenario.futurePreview,

    // Source identifiers
    customerId: scenario.household.customerId,
    customerName: scenario.household.customerName,
    scenarioId: scenario.scenarioId,
    billingPeriodEnd: scenario.forecast.billingPeriodEnd,
  };
}
