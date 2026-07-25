import type { DemoScenario } from '@/domain/scenario';
import type { Recommendation } from '@/domain/recommendation';

/**
 * Forecast Usefulness Evaluation
 *
 * Determines whether a forecast is actionable enough to support recommendations.
 */
export type ForecastUsefulness =
  'fully_actionable' | 'limited_but_actionable' | 'not_actionable';

export interface UsefulnessEvaluation {
  usefulness: ForecastUsefulness;
  reason: string;
  allowRecommendations: boolean;
  requiresSupport: boolean;
}

/**
 * Evaluate forecast usefulness based on data quality and range width
 */
export function evaluateForecastUsefulness(
  scenario: DemoScenario
): UsefulnessEvaluation {
  const { forecast } = scenario;
  const rangeWidth = forecast.expectedRange.high - forecast.expectedRange.low;
  const rangeWidthPercent = rangeWidth / forecast.expectedBill;

  // Full interval data with narrow range
  if (
    forecast.dataQualityTier === 'full' &&
    forecast.sourceCadence === 'interval' &&
    rangeWidthPercent < 0.25
  ) {
    return {
      usefulness: 'fully_actionable',
      reason: 'Full interval data available with narrow uncertainty range',
      allowRecommendations: true,
      requiresSupport: false,
    };
  }

  // Limited data but still useful
  if (
    (forecast.dataQualityTier === 'limited' ||
      forecast.sourceCadence === 'monthly-read' ||
      forecast.sourceCadence === 'cohort-based') &&
    rangeWidthPercent < 0.4
  ) {
    return {
      usefulness: 'limited_but_actionable',
      reason: 'Limited data available; only low-risk recommendations provided',
      allowRecommendations: true,
      requiresSupport: false,
    };
  }

  // Range too wide or data insufficient
  if (rangeWidthPercent >= 0.4 || forecast.dataQualityTier === 'insufficient') {
    return {
      usefulness: 'not_actionable',
      reason:
        'Insufficient data quality or range too wide for actionable recommendations',
      allowRecommendations: false,
      requiresSupport: true,
    };
  }

  // Default to limited but actionable
  return {
    usefulness: 'limited_but_actionable',
    reason: 'Estimate available with directional guidance',
    allowRecommendations: true,
    requiresSupport: false,
  };
}

/**
 * Filter recommendations based on consent dependencies
 */
export function filterRecommendationsByConsent(
  recommendations: Recommendation[],
  scenario: DemoScenario
): Recommendation[] {
  return recommendations.map((rec) => {
    // Check if recommendation requires consent that hasn't been granted
    if (rec.requiredConsentPurposes && rec.requiredConsentPurposes.length > 0) {
      const hasAllRequiredConsent = rec.requiredConsentPurposes.every(
        (purpose) => {
          const permission = scenario.consentState.permissions.find(
            (p) => p.purpose === purpose
          );
          return permission?.status === 'granted';
        }
      );

      if (!hasAllRequiredConsent) {
        return {
          ...rec,
          status: 'unavailable' as const,
        };
      }
    }

    return rec;
  });
}

/**
 * Determine if interval meter consent affects data quality
 */
export function getDataQualityFromConsent(
  scenario: DemoScenario
): 'full' | 'limited' {
  const intervalMeterPermission = scenario.consentState.permissions.find(
    (p) => p.purpose === 'interval_meter_personalization'
  );

  if (intervalMeterPermission?.status === 'granted') {
    return 'full';
  }

  return 'limited';
}

export function applyRecommendationPolicy(
  scenario: DemoScenario
): Recommendation[] {
  const usefulness = evaluateForecastUsefulness(scenario);
  const consentFiltered = filterRecommendationsByConsent(
    scenario.recommendations,
    scenario
  );

  return consentFiltered.map((recommendation) => {
    const policySuppressed =
      scenario.safetyDecision.status === 'suppress' &&
      recommendation.policyDecisionId ===
        scenario.safetyDecision.policyDecisionId;

    if (policySuppressed) {
      return {
        ...recommendation,
        status: 'suppressed' as const,
        benefit: undefined,
      };
    }

    if (
      !usefulness.allowRecommendations &&
      recommendation.mode !== 'advisor_assisted'
    ) {
      return {
        ...recommendation,
        status: 'unavailable' as const,
        benefit: undefined,
      };
    }

    return recommendation;
  });
}
