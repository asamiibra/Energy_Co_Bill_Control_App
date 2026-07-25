import type { ExplanationEvidenceLedger } from './explanation-evidence-ledger';

export interface ExplanationFaithfulnessResult {
  isValid: boolean;
  failedRules: string[];
  ledgerVersion: string;
}

export interface RenderedExplanation {
  summary: string;
  drivers: string[];
  recommendations?: Array<{
    id: string;
    title: string;
    benefit?: {
      low: number;
      high: number;
    };
  }>;
  numericClaims?: Array<{
    value: number;
    context: string;
  }>;
  driverClaims?: Array<{
    id: string;
    direction: 'up' | 'down' | 'neutral';
    contributionRange?: { low: number; high: number };
  }>;
  forecastVersionId?: string;
  dataQualityTier?: ExplanationEvidenceLedger['dataQualityTier'];
  policyDecisionId?: string;
  consentClaims?: Array<{
    purpose: string;
    status: string;
  }>;
  assumptions?: string[];
  tariffTerms?: {
    exitFee: number;
    termMonths: number;
    higherPeakRates: boolean;
  };
  deviceClaims?: Array<{
    asset: 'EV' | 'smart thermostat' | 'solar' | 'battery';
    present: boolean;
  }>;
  futureActionStatus?: 'not_available_in_mvp';
}

/**
 * Validate that a rendered explanation is faithful to the evidence ledger.
 *
 * Before any explanation is displayed, this validator must confirm:
 * - Every numeric claim matches an exact ledger field
 * - Every named driver exists in the ledger
 * - Every magnitude and direction matches the ledger
 * - Every recommendation ID exists and is available under current policy
 * - Every benefit estimate includes approved assumptions
 * - No suppressed recommendation is narrated as available
 * - No source or freshness statement is invented
 *
 * On failure:
 * 1. Block the generated explanation
 * 2. Render the approved safe fallback template
 * 3. Record explanation_faithfulness_failed
 * 4. Include ledger version, template version, and failed rule in audit
 */
export function validateExplanationFaithfulness(
  explanation: RenderedExplanation,
  ledger: ExplanationEvidenceLedger
): ExplanationFaithfulnessResult {
  const failedRules: string[] = [];

  // Validate numeric claims if present
  if (explanation.numericClaims) {
    explanation.numericClaims.forEach((claim) => {
      const expectedValue = getExpectedNumericClaim(ledger, claim.context);
      if (expectedValue === undefined || expectedValue !== claim.value) {
        failedRules.push(
          `Numeric claim ${claim.value} (${claim.context}) does not match ledger`
        );
      }
    });
  }

  explanation.driverClaims?.forEach((claim) => {
    const driver = ledger.drivers.find(
      (candidate) => candidate.id === claim.id
    );
    if (!driver) {
      failedRules.push(`Unsupported driver ${claim.id}`);
      return;
    }
    if (driver.direction !== claim.direction) {
      failedRules.push(
        `Driver direction for ${claim.id} does not match ledger`
      );
    }
    if (
      claim.contributionRange &&
      (driver.contributionRange?.low !== claim.contributionRange.low ||
        driver.contributionRange?.high !== claim.contributionRange.high)
    ) {
      failedRules.push(
        `Driver magnitude for ${claim.id} does not match ledger`
      );
    }
  });

  // Validate drivers mentioned in explanation
  explanation.drivers.forEach((driverText) => {
    const mentionsLedgerDriver = ledger.drivers.some(
      (driver) =>
        driverText.toLowerCase().includes(driver.title.toLowerCase()) ||
        driverText === driver.explanation
    );

    if (
      !mentionsLedgerDriver &&
      driverText.length > 0 &&
      !driverText.toLowerCase().includes('missing data')
    ) {
      // Allow "missing data" as a valid explanation element
      failedRules.push(
        `Driver explanation not traceable to ledger: ${driverText}`
      );
    }
  });

  // Validate recommendations if present
  if (explanation.recommendations) {
    const ledgerRecIds = new Set(
      ledger.recommendations.map((r) => r.recommendationId)
    );

    explanation.recommendations.forEach((rec) => {
      if (!ledgerRecIds.has(rec.id)) {
        failedRules.push(
          `Recommendation ${rec.id} not found in ledger or is suppressed`
        );
      }

      // Validate benefit values match ledger
      if (rec.benefit) {
        const ledgerRec = ledger.recommendations.find(
          (r) => r.recommendationId === rec.id
        );
        if (
          ledgerRec?.benefit &&
          (rec.benefit.low !== ledgerRec.benefit.low ||
            rec.benefit.high !== ledgerRec.benefit.high)
        ) {
          failedRules.push(`Benefit values for ${rec.id} do not match ledger`);
        }
      }
    });
  }

  if (
    explanation.forecastVersionId &&
    explanation.forecastVersionId !== ledger.forecastVersionId
  ) {
    failedRules.push('Forecast version does not match ledger');
  }

  if (
    explanation.dataQualityTier &&
    explanation.dataQualityTier !== ledger.dataQualityTier
  ) {
    failedRules.push('Data-quality statement does not match ledger');
  }

  if (
    explanation.policyDecisionId &&
    explanation.policyDecisionId !== ledger.policyDecisionId
  ) {
    failedRules.push('Policy decision does not match ledger');
  }

  explanation.consentClaims?.forEach((claim) => {
    const permission = ledger.consentPermissions.find(
      (candidate) => candidate.purpose === claim.purpose
    );
    if (!permission || permission.status !== claim.status) {
      failedRules.push(
        `Consent claim for ${claim.purpose} does not match ledger`
      );
    }
  });

  explanation.assumptions?.forEach((assumption) => {
    const approved = ledger.allRecommendations.some((recommendation) =>
      recommendation.benefit?.assumptions.includes(assumption)
    );
    const futureApproved =
      ledger.futurePreview?.kind === 'tariff' &&
      ledger.futurePreview.assumptions.includes(assumption);
    if (!approved && !futureApproved) {
      failedRules.push(`Unsupported assumption: ${assumption}`);
    }
  });

  if (ledger.futurePreview?.kind === 'tariff') {
    const terms = explanation.tariffTerms;
    if (!terms) {
      failedRules.push('Tariff explanation omits contract terms and exit fee');
    } else if (
      terms.exitFee !== ledger.futurePreview.exitFee ||
      terms.termMonths !== ledger.futurePreview.termMonths ||
      terms.higherPeakRates !== ledger.futurePreview.higherPeakRates
    ) {
      failedRules.push('Tariff terms do not match ledger');
    }
  }

  const assetValues = {
    EV: ledger.assets.hasEV,
    'smart thermostat': ledger.assets.hasSmartThermostat,
    solar: ledger.assets.hasSolar,
    battery: ledger.assets.hasBattery,
  };
  explanation.deviceClaims?.forEach((claim) => {
    if (assetValues[claim.asset] !== claim.present) {
      failedRules.push(`Device asset ${claim.asset} does not match ledger`);
    }
  });

  const fullText = [
    explanation.summary,
    ...explanation.drivers,
    ...(explanation.recommendations?.map(
      (recommendation) => recommendation.title
    ) ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (/\bguaranteed? savings?\b/.test(fullText)) {
    failedRules.push('Guaranteed-savings claim is prohibited');
  }
  if (
    /\b(action|switch|command) (was|has been) (executed|completed)\b/.test(
      fullText
    )
  ) {
    failedRules.push('Executed-action claim is prohibited');
  }
  if (
    /\b(sent|transferred|shared) (your )?data (to|with) (a )?partner\b/.test(
      fullText
    )
  ) {
    failedRules.push('Partner-transfer claim is prohibited');
  }
  if (/\blive (device )?telemetry\b/.test(fullText)) {
    failedRules.push('Fabricated live telemetry claim is prohibited');
  }
  if (
    ledger.safetyStatus === 'suppress' &&
    ledger.allRecommendations.some(
      (recommendation) =>
        recommendation.status === 'suppressed' &&
        fullText.includes(recommendation.title.toLowerCase()) &&
        /\bavailable\b/.test(fullText)
    )
  ) {
    failedRules.push('Suppressed action described as available');
  }
  if (
    ledger.futurePreview &&
    explanation.futureActionStatus !== 'not_available_in_mvp'
  ) {
    failedRules.push('Future action status is missing or executable');
  }

  return {
    isValid: failedRules.length === 0,
    failedRules,
    ledgerVersion: ledger.forecastVersionId,
  };
}

/**
 * Extract all numeric values from ledger for validation
 */
function getExpectedNumericClaim(
  ledger: ExplanationEvidenceLedger,
  context: string
): number | undefined {
  const values: Record<string, number | undefined> = {
    expectedBill: ledger.expectedBill,
    expectedRangeLow: ledger.expectedRange.low,
    expectedRangeHigh: ledger.expectedRange.high,
    billToDate: ledger.billToDate,
    daysRemaining: ledger.daysRemaining,
    missingMeterDays: ledger.missingMeterDays,
    previousExpectedBill: ledger.previousExpectedBill,
    previousExpectedRangeLow: ledger.previousExpectedRange?.low,
    previousExpectedRangeHigh: ledger.previousExpectedRange?.high,
  };

  if (context in values) {
    return values[context];
  }

  const [kind, id, field] = context.split(':');
  if (kind === 'driver') {
    const driver = ledger.drivers.find((candidate) => candidate.id === id);
    return field === 'low'
      ? driver?.contributionRange?.low
      : driver?.contributionRange?.high;
  }
  if (kind === 'benefit') {
    const recommendation = ledger.allRecommendations.find(
      (candidate) => candidate.recommendationId === id
    );
    return field === 'low'
      ? recommendation?.benefit?.low
      : recommendation?.benefit?.high;
  }

  return undefined;
}

/**
 * Get the safe fallback explanation when validation fails
 */
export function getSafeFallbackExplanation(): RenderedExplanation {
  return {
    summary:
      'Your bill estimate is based on your recent usage, weather conditions, and tariff structure.',
    drivers: [
      'Your estimate uses recent meter data and billing history.',
      'Weather conditions and seasonal patterns are factored in.',
      'Your current tariff and rate structure affect the estimate.',
    ],
    recommendations: [],
  };
}
