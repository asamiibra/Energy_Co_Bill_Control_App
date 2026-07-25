import { describe, it, expect } from 'vitest';
import { validateAllFixtures } from '@/lib/fixture-validation';
import { scenarios } from '@/data/scenarios';
import { daysBetween } from '@/lib/format-date';

describe('Fixture Validation', () => {
  describe('Schema Validation', () => {
    it('should validate all fixtures pass schema validation', () => {
      const errors = validateAllFixtures();
      const schemaErrors = errors.filter((e) => e.rule === 'schema_validation');
      expect(schemaErrors).toHaveLength(0);
    });
  });

  describe('Expected Bill Inside Range', () => {
    it('should ensure expected bill falls inside expected range for all scenarios', () => {
      Object.values(scenarios).forEach((scenario) => {
        const { expectedBill, expectedRange } = scenario.forecast;
        expect(expectedBill).toBeGreaterThanOrEqual(expectedRange.low);
        expect(expectedBill).toBeLessThanOrEqual(expectedRange.high);
      });
    });
  });

  describe('Date Reconciliation', () => {
    it('should ensure days remaining matches scenario dates', () => {
      Object.values(scenarios).forEach((scenario) => {
        if (scenario.forecast.billingStatus === 'closed') {
          expect(scenario.forecast.daysRemaining).toBe(0);
          return;
        }
        const calculatedDays = daysBetween(
          scenario.anchorDate,
          scenario.forecast.billingPeriodEnd
        );
        const tolerance = 1; // Allow 1 day tolerance
        expect(
          Math.abs(calculatedDays - scenario.forecast.daysRemaining)
        ).toBeLessThanOrEqual(tolerance);
      });
    });
  });

  describe('Forecast Versions', () => {
    it('should ensure baseline and alert are different billing cycles', () => {
      const baseline = scenarios.baseline;
      const alert = scenarios.alert;

      expect(baseline.forecast.billingPeriodEnd).not.toBe(
        alert.forecast.billingPeriodEnd
      );
    });

    it('should ensure alert has previous forecast', () => {
      const alert = scenarios.alert;
      expect(alert.previousForecast).toBeDefined();
    });

    it('should ensure revised forecast references earlier version', () => {
      const alert = scenarios.alert;
      if (alert.previousForecast) {
        const prevDate = new Date(alert.previousForecast.generatedAt);
        const currDate = new Date(alert.forecast.generatedAt);
        expect(prevDate.getTime()).toBeLessThan(currDate.getTime());
        expect(alert.previousForecast.forecastVersionId).not.toBe(
          alert.forecast.forecastVersionId
        );
      }
    });
  });

  describe('Safety Scenarios', () => {
    it('should ensure safety recommendation is suppressed', () => {
      const safety = scenarios.safety;
      const suppressedRec = safety.recommendations.find(
        (r) => r.status === 'suppressed'
      );
      expect(suppressedRec).toBeDefined();
    });

    it('should ensure suppressed recommendations have no benefit estimates', () => {
      Object.values(scenarios).forEach((scenario) => {
        scenario.recommendations.forEach((rec) => {
          if (rec.status === 'suppressed') {
            expect(rec.benefit).toBeUndefined();
          }
        });
      });
    });

    it('should ensure safety scenario uses different customer', () => {
      const baseline = scenarios.baseline;
      const safety = scenarios.safety;
      expect(baseline.household.customerId).not.toBe(
        safety.household.customerId
      );
    });
  });

  describe('Benefit Estimates', () => {
    it('should ensure all benefit estimates include assumptions', () => {
      Object.values(scenarios).forEach((scenario) => {
        scenario.recommendations.forEach((rec) => {
          if (rec.benefit) {
            expect(rec.benefit.assumptions.length).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should ensure future governed actions are not marked available', () => {
      Object.values(scenarios).forEach((scenario) => {
        scenario.recommendations.forEach((rec) => {
          if (rec.mode === 'future_governed_action') {
            expect(rec.status).not.toBe('available');
          }
        });
      });
    });
  });

  describe('Alert Scenario Validation', () => {
    it('should validate canonical alert values', () => {
      const alert = scenarios.alert;

      // Previous forecast values
      expect(alert.previousForecast?.expectedBill).toBe(164);
      expect(alert.previousForecast?.expectedRange.low).toBe(154);
      expect(alert.previousForecast?.expectedRange.high).toBe(181);

      // Revised forecast values
      expect(alert.forecast.expectedBill).toBe(186);
      expect(alert.forecast.expectedRange.low).toBe(168);
      expect(alert.forecast.expectedRange.high).toBe(204);

      // Missing meter days
      expect(alert.forecast.missingMeterDays).toBe(2);
    });
  });
});
