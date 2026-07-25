import { describe, it, expect } from 'vitest';
import { evaluateMaterialChange } from '@/lib/material-change-evaluator';
import { scenarios } from '@/data/scenarios';

describe('Material Change Evaluator', () => {
  describe('Canonical Alert Scenario', () => {
    it('should trigger material change alert for canonical scenario', () => {
      const alert = scenarios.alert;

      if (!alert.previousForecast) {
        throw new Error('Alert scenario must have previous forecast');
      }

      const evaluation = evaluateMaterialChange(
        alert.previousForecast,
        alert.forecast
      );

      expect(evaluation.isAlert).toBe(true);
      expect(evaluation.triggeredReasons).toContain('point_estimate_movement');
      expect(evaluation.triggeredReasons).toContain('range_width_increase');
      expect(evaluation.triggeredReasons).toContain('data_quality_degradation');
    });

    it('should calculate correct change values for canonical alert', () => {
      const alert = scenarios.alert;

      if (!alert.previousForecast) {
        throw new Error('Alert scenario must have previous forecast');
      }

      const evaluation = evaluateMaterialChange(
        alert.previousForecast,
        alert.forecast
      );

      // Absolute change: $186 - $164 = $22
      expect(evaluation.details.absoluteChange).toBe(22);

      // Relative change: $22 / $164 ≈ 0.134 (13.4%)
      expect(evaluation.details.relativeChange).toBeCloseTo(0.134, 2);

      // Previous range width: $181 - $154 = $27
      expect(evaluation.details.previousRangeWidth).toBe(27);

      // Revised range width: $204 - $168 = $36
      expect(evaluation.details.revisedRangeWidth).toBe(36);

      // Range width increase: ($36 - $27) / $27 ≈ 0.333 (33.3%)
      expect(evaluation.details.rangeWidthIncreasePercent).toBeCloseTo(
        0.333,
        2
      );
    });
  });

  describe('Threshold Testing', () => {
    it('should not trigger alert for below-threshold changes', () => {
      // Create forecasts with small changes
      const previousForecast = {
        forecastVersionId: 'TEST-V1',
        generatedAt: '2026-07-20T08:00:00Z',
        billingPeriodStart: '2026-07-03',
        billingPeriodEnd: '2026-08-02',
        billToDate: 128.36,
        expectedBill: 178,
        expectedRange: { low: 171, high: 204 },
        daysRemaining: 12,
        dataQualityTier: 'full' as const,
        sourceCadence: 'interval' as const,
        missingMeterDays: 0,
      };

      const revisedForecast = {
        ...previousForecast,
        forecastVersionId: 'TEST-V2',
        generatedAt: '2026-07-21T08:00:00Z',
        expectedBill: 180, // Only $2 increase
        daysRemaining: 11,
      };

      const evaluation = evaluateMaterialChange(
        previousForecast,
        revisedForecast
      );

      // Should not trigger alert ($2 < $15 threshold and 1.1% < 8% threshold)
      expect(evaluation.isAlert).toBe(false);
      expect(evaluation.triggeredReasons).toHaveLength(0);
    });

    it('should trigger alert when absolute threshold is met', () => {
      const previousForecast = {
        forecastVersionId: 'TEST-V1',
        generatedAt: '2026-07-20T08:00:00Z',
        billingPeriodStart: '2026-07-03',
        billingPeriodEnd: '2026-08-02',
        billToDate: 128.36,
        expectedBill: 100,
        expectedRange: { low: 95, high: 105 },
        daysRemaining: 12,
        dataQualityTier: 'full' as const,
        sourceCadence: 'interval' as const,
        missingMeterDays: 0,
      };

      const revisedForecast = {
        ...previousForecast,
        forecastVersionId: 'TEST-V2',
        expectedBill: 116, // $16 increase (above $15 threshold)
      };

      const evaluation = evaluateMaterialChange(
        previousForecast,
        revisedForecast
      );
      expect(evaluation.isAlert).toBe(true);
      expect(evaluation.triggeredReasons).toContain('point_estimate_movement');
      expect(evaluation.details.absoluteThresholdMet).toBe(true);
    });

    it('should trigger alert when relative threshold is met', () => {
      const previousForecast = {
        forecastVersionId: 'TEST-V1',
        generatedAt: '2026-07-20T08:00:00Z',
        billingPeriodStart: '2026-07-03',
        billingPeriodEnd: '2026-08-02',
        billToDate: 128.36,
        expectedBill: 100,
        expectedRange: { low: 90, high: 110 },
        daysRemaining: 12,
        dataQualityTier: 'full' as const,
        sourceCadence: 'interval' as const,
        missingMeterDays: 0,
      };

      const revisedForecast = {
        ...previousForecast,
        forecastVersionId: 'TEST-V2',
        expectedBill: 109, // $9 increase (9% > 8%, but below $15)
      };

      const evaluation = evaluateMaterialChange(
        previousForecast,
        revisedForecast
      );
      expect(evaluation.isAlert).toBe(true);
      expect(evaluation.triggeredReasons).toContain('point_estimate_movement');
      expect(evaluation.details.absoluteThresholdMet).toBe(false);
      expect(evaluation.details.relativeThresholdMet).toBe(true);
    });

    it('should trigger alert when range width increases significantly', () => {
      const previousForecast = {
        forecastVersionId: 'TEST-V1',
        generatedAt: '2026-07-20T08:00:00Z',
        billingPeriodStart: '2026-07-03',
        billingPeriodEnd: '2026-08-02',
        billToDate: 128.36,
        expectedBill: 178,
        expectedRange: { low: 170, high: 190 }, // Width: $20
        daysRemaining: 12,
        dataQualityTier: 'full' as const,
        sourceCadence: 'interval' as const,
        missingMeterDays: 0,
      };

      const revisedForecast = {
        ...previousForecast,
        forecastVersionId: 'TEST-V2',
        expectedRange: { low: 165, high: 195 }, // Width: $30 (50% increase > 25% threshold)
      };

      const evaluation = evaluateMaterialChange(
        previousForecast,
        revisedForecast
      );
      expect(evaluation.isAlert).toBe(true);
      expect(evaluation.triggeredReasons).toContain('range_width_increase');
    });

    it('triggers on data quality, recommendation, and safety changes', () => {
      const previous = scenarios.alert.previousForecast!;
      const revised = {
        ...previous,
        forecastVersionId: 'TEST-V2',
        generatedAt: '2026-08-22T08:00:00Z',
        dataQualityTier: 'limited' as const,
      };
      const evaluation = evaluateMaterialChange(previous, revised, undefined, {
        recommendationChanged: true,
        safetyStateChanged: true,
      });
      expect(evaluation.triggeredReasons).toEqual(
        expect.arrayContaining([
          'data_quality_degradation',
          'recommendation_changed',
          'safety_state_changed',
        ])
      );
    });
  });
});
