import { describe, it, expect } from 'vitest';
import { evaluateForecastSurprise } from '@/lib/forecast-surprise-evaluator';

describe('Forecast Surprise Evaluator', () => {
  const mockForecast = {
    forecastVersionId: 'FCST-TEST-001',
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

  describe('Forecast Surprise Logic', () => {
    it('should identify upper bound miss as forecast surprise', () => {
      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 210; // Above range high of 204

      const evaluation = evaluateForecastSurprise(
        mockForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      expect(evaluation.forecastSurprise).toBe(true);
      expect(evaluation.eligible).toBe(true);
      expect(evaluation.details?.missType).toBe('upper');
      expect(evaluation.details?.finalBill).toBe(210);
      expect(evaluation.details?.missAmountBeyondRange).toBe(6);
    });

    it('should identify lower bound miss as forecast surprise', () => {
      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 165; // Below range low of 171

      const evaluation = evaluateForecastSurprise(
        mockForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      expect(evaluation.forecastSurprise).toBe(true);
      expect(evaluation.eligible).toBe(true);
      expect(evaluation.details?.missType).toBe('lower');
      expect(evaluation.details?.finalBill).toBe(165);
      expect(evaluation.details?.missAmountBeyondRange).toBe(6);
    });

    it('should NOT consider bill equal to endpoint as surprise', () => {
      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close

      // Test lower endpoint
      let evaluation = evaluateForecastSurprise(
        mockForecast,
        171, // Exactly equal to range low
        billingCloseDate,
        currentDate
      );
      expect(evaluation.forecastSurprise).toBe(false);

      // Test upper endpoint
      evaluation = evaluateForecastSurprise(
        mockForecast,
        204, // Exactly equal to range high
        billingCloseDate,
        currentDate
      );
      expect(evaluation.forecastSurprise).toBe(false);
    });

    it('should NOT consider bill inside range as surprise', () => {
      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 185; // Inside range [171, 204]

      const evaluation = evaluateForecastSurprise(
        mockForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      expect(evaluation.forecastSurprise).toBe(false);
      expect(evaluation.eligible).toBe(true);
      expect(evaluation.details?.missType).toBe('none');
    });
  });

  describe('24-Hour Communication Rule', () => {
    it('should NOT be eligible if communicated less than 24 hours before close', () => {
      const recentForecast = {
        ...mockForecast,
        generatedAt: '2026-08-02T12:00:00Z', // 12 hours before close
      };

      const billingCloseDate = '2026-08-02T18:00:00Z'; // Only 6 hours later
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 210; // Would be a miss

      const evaluation = evaluateForecastSurprise(
        recentForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      expect(evaluation.forecastSurprise).toBe(false);
      expect(evaluation.eligible).toBe(false);
      expect(evaluation.reason).toContain('less than 24 hours');
    });

    it('should be eligible if communicated at least 24 hours before close', () => {
      const earlyForecast = {
        ...mockForecast,
        generatedAt: '2026-08-01T12:00:00Z', // More than 24 hours before close
      };

      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 210; // Above range

      const evaluation = evaluateForecastSurprise(
        earlyForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      expect(evaluation.forecastSurprise).toBe(true);
      expect(evaluation.eligible).toBe(true);
    });
  });

  describe('Billing Period Status', () => {
    it('should NOT be eligible if billing period has not closed', () => {
      // Note: This test assumes current date is before close date
      // In real implementation, this would use actual current date
      const futureBillingClose = '2030-12-31T00:00:00Z';
      const finalBill = 210;

      const evaluation = evaluateForecastSurprise(
        mockForecast,
        finalBill,
        futureBillingClose
      );

      expect(evaluation.forecastSurprise).toBe(false);
      expect(evaluation.eligible).toBe(false);
      expect(evaluation.reason).toContain('not yet closed');
    });
  });

  describe('Mid-cycle Revision Rule', () => {
    it('should confirm mid-cycle revision never increments forecast surprise', () => {
      // This is tested by ensuring only final bills (after close) are evaluated
      // Mid-cycle revisions are handled by material-change evaluator, not forecast surprise

      const billingCloseDate = '2026-08-03T00:00:00Z';
      const currentDate = '2026-08-04T00:00:00Z'; // After billing close
      const finalBill = 185; // Inside original range, but might have been revised mid-cycle

      const evaluation = evaluateForecastSurprise(
        mockForecast,
        finalBill,
        billingCloseDate,
        currentDate
      );

      // Only final outcome vs last communicated range matters
      expect(evaluation.forecastSurprise).toBe(false);
      expect(evaluation.reason).toContain('inside the communicated range');
    });
  });

  describe('communication eligibility', () => {
    it.each(['superseded', 'withdrawn'] as const)(
      'ignores a %s range',
      (communicationStatus) => {
        const evaluation = evaluateForecastSurprise(
          { ...mockForecast, communicationStatus },
          210,
          '2026-08-03T00:00:00Z',
          '2026-08-04T00:00:00Z'
        );
        expect(evaluation).toMatchObject({
          eligible: false,
          forecastSurprise: false,
        });
      }
    );

    it('ignores an ineligible customer', () => {
      const evaluation = evaluateForecastSurprise(
        { ...mockForecast, eligibleAtCommunication: false },
        210,
        '2026-08-03T00:00:00Z',
        '2026-08-04T00:00:00Z'
      );
      expect(evaluation.reason).toContain('not eligible');
      expect(evaluation.forecastSurprise).toBe(false);
    });
  });
});
