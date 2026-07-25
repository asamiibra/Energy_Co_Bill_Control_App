import type { ExplanationEvidenceLedger } from './explanation-evidence-ledger';
import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import {
  getSafeFallbackExplanation,
  validateExplanationFaithfulness,
} from './explanation-faithfulness-validator';
import { auditLedger } from './audit-ledger';
import { EVENT_NAMES } from '@/domain/event';

/**
 * Explanation Presenter
 *
 * Uses deterministic templates to generate customer-facing explanations.
 * NO live LLM call is permitted in the MVP.
 *
 * The explanation layer:
 * - Consumes ONLY the approved Explanation Evidence Ledger
 * - Uses deterministic templates in the prototype
 * - May vary tone and reading level without changing factual content
 * - CANNOT invent, recompute, adjust, or overwrite authoritative values
 * - CANNOT introduce a driver, magnitude, action, or policy rationale absent from the ledger
 * - Returns a safe template fallback if factual-consistency validation fails
 */

export interface FormattedExplanation {
  forecastSummary: string;
  rangeSummary: string;
  driversSummary: string;
  driverDetails: string[];
  revisionSummary?: string;
  dataQualityNote?: string;
  recommendationSummary?: string;
  safetySummary?: string;
}

const TEMPLATE_VERSION = 'EXPLANATION-TEMPLATE-V1';

function validateFormattedExplanation(
  explanation: FormattedExplanation,
  ledger: ExplanationEvidenceLedger
): FormattedExplanation {
  const result = validateExplanationFaithfulness(
    {
      summary: explanation.forecastSummary,
      drivers: explanation.driverDetails,
      recommendations: ledger.recommendations.map((recommendation) => ({
        id: recommendation.recommendationId,
        title: recommendation.title,
        benefit: recommendation.benefit
          ? {
              low: recommendation.benefit.low,
              high: recommendation.benefit.high,
            }
          : undefined,
      })),
      numericClaims: [
        { value: ledger.expectedBill, context: 'expectedBill' },
        { value: ledger.expectedRange.low, context: 'expectedRangeLow' },
        { value: ledger.expectedRange.high, context: 'expectedRangeHigh' },
      ],
      driverClaims: ledger.drivers.map((driver) => ({
        id: driver.id,
        direction: driver.direction,
        contributionRange: driver.contributionRange,
      })),
      forecastVersionId: ledger.forecastVersionId,
      dataQualityTier: ledger.dataQualityTier,
      policyDecisionId: ledger.policyDecisionId,
      assumptions: ledger.recommendations.flatMap(
        (recommendation) => recommendation.benefit?.assumptions ?? []
      ),
    },
    ledger
  );

  if (result.isValid) {
    return explanation;
  }

  auditLedger.recordEvent(EVENT_NAMES.EXPLANATION_FAITHFULNESS_FAILED, {
    scenarioId: ledger.scenarioId,
    householdId: ledger.customerId,
    forecastVersionId: ledger.forecastVersionId,
    policyDecisionId: ledger.policyDecisionId,
    consentVersionId: ledger.consentVersionId,
    properties: {
      ledgerVersion: result.ledgerVersion,
      templateVersion: TEMPLATE_VERSION,
      failedRules: result.failedRules,
    },
  });

  const fallback = getSafeFallbackExplanation();
  return {
    forecastSummary: explanation.forecastSummary,
    rangeSummary: explanation.rangeSummary,
    driversSummary: fallback.summary,
    driverDetails: fallback.drivers,
    safetySummary: explanation.safetySummary,
  };
}

export function generateBaselineExplanation(
  ledger: ExplanationEvidenceLedger
): FormattedExplanation {
  const forecastSummary = `Your bill is currently expected to be ${formatCurrency(ledger.expectedBill, { includeDecimals: false })}.`;

  const rangeSummary = `Expected range: ${formatCurrencyRange(ledger.expectedRange.low, ledger.expectedRange.high)}`;

  // Generate drivers summary
  const driverTitles = ledger.drivers
    .filter((d) => d.direction === 'up')
    .map((d) => d.title.toLowerCase());

  let driversSummary = '';
  if (driverTitles.length > 0) {
    const lastDriver = driverTitles.pop();
    if (driverTitles.length > 0) {
      driversSummary = `${driverTitles.join(', ')}, and ${lastDriver} are the main reasons this estimate is above your recent average.`;
    } else {
      driversSummary = `${lastDriver} is the main reason this estimate is above your recent average.`;
    }
  }

  const driverDetails = ledger.drivers.map((d) => {
    let detail = d.explanation;
    if (d.contributionRange) {
      detail += ` (${formatCurrencyRange(d.contributionRange.low, d.contributionRange.high)})`;
    }
    return detail;
  });

  let dataQualityNote: string | undefined;
  if (ledger.missingMeterDays > 0) {
    dataQualityNote = `${ledger.missingMeterDays} day${ledger.missingMeterDays > 1 ? 's' : ''} of meter data ${ledger.missingMeterDays > 1 ? 'are' : 'is'} missing.`;
  }

  let recommendationSummary: string | undefined;
  if (ledger.recommendations.length > 0) {
    const firstRec = ledger.recommendations[0];
    if (firstRec.benefit) {
      recommendationSummary = `${firstRec.title}. Estimated benefit: ${formatCurrencyRange(firstRec.benefit.low, firstRec.benefit.high)} if ${firstRec.benefit.assumptions[0]?.toLowerCase() || 'maintained as specified'}.`;
    } else {
      recommendationSummary = firstRec.title;
    }
  }

  return validateFormattedExplanation(
    {
      forecastSummary,
      rangeSummary,
      driversSummary,
      driverDetails,
      dataQualityNote,
      recommendationSummary,
    },
    ledger
  );
}

export function generateAlertExplanation(
  ledger: ExplanationEvidenceLedger
): FormattedExplanation {
  if (!ledger.previousExpectedBill || !ledger.previousExpectedRange) {
    throw new Error('Alert explanation requires previous forecast data');
  }

  const revisionSummary = `Your expected bill changed from ${formatCurrency(ledger.previousExpectedBill, { includeDecimals: false })} to ${formatCurrency(ledger.expectedBill, { includeDecimals: false })}.`;

  const rangeSummary = `Previous range: ${formatCurrencyRange(ledger.previousExpectedRange.low, ledger.previousExpectedRange.high)}. Current range: ${formatCurrencyRange(ledger.expectedRange.low, ledger.expectedRange.high)}.`;

  const driverDetails = ledger.drivers.map((d) => d.explanation);

  let dataQualityNote: string | undefined;
  if (ledger.missingMeterDays > 0) {
    dataQualityNote = `${ledger.missingMeterDays} day${ledger.missingMeterDays > 1 ? 's' : ''} of meter data ${ledger.missingMeterDays > 1 ? 'are' : 'is'} missing, so the expected range is wider.`;
  }

  let recommendationSummary: string | undefined;
  if (ledger.recommendations.length > 0) {
    recommendationSummary = `${ledger.recommendations.length} action${ledger.recommendations.length > 1 ? 's' : ''} available to help manage your bill.`;
  }

  return validateFormattedExplanation(
    {
      forecastSummary: `You are trending above your usual monthly usage.`,
      rangeSummary,
      driversSummary: 'Your estimate changed because:',
      driverDetails,
      revisionSummary,
      dataQualityNote,
      recommendationSummary,
    },
    ledger
  );
}

export function generateSafetyExplanation(
  ledger: ExplanationEvidenceLedger
): FormattedExplanation {
  const safetySummary =
    ledger.safetyMessage ||
    'Certain recommendations have been limited to protect essential usage.';

  const forecastSummary = `Your expected bill is ${formatCurrency(ledger.expectedBill, { includeDecimals: false })}, with a range of ${formatCurrencyRange(ledger.expectedRange.low, ledger.expectedRange.high)}.`;

  const driverDetails = ledger.drivers.map((d) => d.explanation);

  return validateFormattedExplanation(
    {
      forecastSummary,
      rangeSummary: `Expected range: ${formatCurrencyRange(ledger.expectedRange.low, ledger.expectedRange.high)}`,
      driversSummary: 'Your estimate is based on:',
      driverDetails,
      safetySummary,
    },
    ledger
  );
}
