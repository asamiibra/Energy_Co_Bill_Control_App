import type { ForecastSnapshot } from '@/domain/forecast';
import type {
  MaterialChangeConfig,
  MaterialChangeEvaluation,
} from '@/domain/material-change';
import { DEFAULT_MATERIAL_CHANGE_CONFIG } from '@/domain/material-change';

/**
 * Evaluate whether a forecast revision constitutes a material change alert
 * based on configured thresholds.
 *
 * These are prototype default thresholds, not claimed production thresholds.
 * Production thresholds must be established from back-testing, customer research,
 * complaint sensitivity, and Day-30 calibration.
 */
export function evaluateMaterialChange(
  previousForecast: ForecastSnapshot,
  revisedForecast: ForecastSnapshot,
  config: MaterialChangeConfig = DEFAULT_MATERIAL_CHANGE_CONFIG,
  changes: {
    recommendationChanged?: boolean;
    safetyStateChanged?: boolean;
  } = {}
): MaterialChangeEvaluation {
  const triggeredReasons: MaterialChangeEvaluation['triggeredReasons'] = [];

  // Calculate changes
  const absoluteChange = Math.abs(
    revisedForecast.expectedBill - previousForecast.expectedBill
  );
  const relativeChange =
    absoluteChange / Math.abs(previousForecast.expectedBill);

  const previousRangeWidth =
    previousForecast.expectedRange.high - previousForecast.expectedRange.low;
  const revisedRangeWidth =
    revisedForecast.expectedRange.high - revisedForecast.expectedRange.low;
  const rangeWidthChange = revisedRangeWidth - previousRangeWidth;
  const rangeWidthIncreasePercent = rangeWidthChange / previousRangeWidth;

  // Check point estimate movement
  const absoluteThresholdMet =
    absoluteChange >= config.absolutePointChangeDollars;
  const relativeThresholdMet =
    relativeChange >= config.relativePointChangePercent;

  if (absoluteThresholdMet || relativeThresholdMet) {
    triggeredReasons.push('point_estimate_movement');
  }

  // Check range width increase
  if (
    rangeWidthIncreasePercent >= config.rangeWidthIncreasePercent &&
    rangeWidthChange > 0
  ) {
    triggeredReasons.push('range_width_increase');
  }

  if (config.alertWhenRecommendationChanges && changes.recommendationChanged) {
    triggeredReasons.push('recommendation_changed');
  }

  if (config.alertWhenSafetyStateChanges && changes.safetyStateChanged) {
    triggeredReasons.push('safety_state_changed');
  }

  // Check data quality degradation
  if (
    config.alertOnDataQualityDegradation &&
    revisedForecast.dataQualityTier !== previousForecast.dataQualityTier
  ) {
    const tierOrder = ['full', 'limited', 'insufficient'];
    const previousTierIndex = tierOrder.indexOf(
      previousForecast.dataQualityTier
    );
    const revisedTierIndex = tierOrder.indexOf(revisedForecast.dataQualityTier);

    if (revisedTierIndex > previousTierIndex) {
      triggeredReasons.push('data_quality_degradation');
    }
  }

  return {
    isAlert: triggeredReasons.length > 0,
    triggeredReasons,
    details: {
      absoluteChange,
      relativeChange,
      previousRangeWidth,
      revisedRangeWidth,
      rangeWidthIncreasePercent,
      absoluteThresholdMet,
      relativeThresholdMet,
    },
  };
}
