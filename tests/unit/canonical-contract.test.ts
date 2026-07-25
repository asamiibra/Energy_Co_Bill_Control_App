import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { scenarios } from '@/data/scenarios';
import { evaluateForecastUsefulness } from '@/services/policy-service';

describe('canonical scenario contract', () => {
  it('registers exactly the nine customer states', () => {
    expect(Object.keys(scenarios)).toEqual([
      'baseline',
      'alert',
      'safety',
      'limited-data',
      'cold-start',
      'cold-start-refined',
      'forecast-miss',
      'consent',
      'tariff-preview',
      'connected-home-preview',
    ]);
  });

  it('locks baseline values and relationships', () => {
    const scenario = scenarios.baseline;
    expect(scenario.scenarioId).toBe('baseline_alex_summer');
    expect(scenario.household.customerName).toBe('Alex Morgan');
    expect(scenario.forecast).toMatchObject({
      billToDate: 128.36,
      expectedBill: 178,
      expectedRange: { low: 171, high: 204 },
      daysRemaining: 8,
      forecastVersionId: 'FCST-ALEX-20260725-01',
    });
    expect(scenario.drivers).toHaveLength(3);
    expect(scenario.recommendations[0]).toMatchObject({
      title: 'Adjust cooling by 2°F for seven days',
      benefit: { low: 12, high: 18 },
    });
  });

  it('locks alert values without reusing the July baseline', () => {
    const scenario = scenarios.alert;
    expect(scenario.previousForecast).toMatchObject({
      expectedBill: 164,
      expectedRange: { low: 154, high: 181 },
      forecastVersionId: 'FCST-ALEX-20260821-01',
    });
    expect(scenario.forecast).toMatchObject({
      expectedBill: 186,
      expectedRange: { low: 168, high: 204 },
      missingMeterDays: 2,
      forecastVersionId: 'FCST-ALEX-20260825-02',
    });
    expect(scenario.previousForecast?.expectedBill).not.toBe(
      scenarios.baseline.forecast.expectedBill
    );
    expect(scenario.cohortContext.usageVariancePercent).toBe(18);
  });

  it('locks safety suppression with no bypass or benefit', () => {
    const scenario = scenarios.safety;
    expect(scenario.household.customerName).toBe('Jordan Lee');
    expect(scenario.safetyDecision).toMatchObject({
      policyDecisionId: 'POLICY-JORDAN-ESSENTIAL-001',
      status: 'suppress',
      source: 'customer_declared',
    });
    const suppressed = scenario.recommendations.find(
      (recommendation) => recommendation.status === 'suppressed'
    );
    expect(suppressed?.benefit).toBeUndefined();
    expect(suppressed?.title).toBe('Reduce essential heating overnight');
  });

  it('locks resilience and future-preview values', () => {
    expect(scenarios['limited-data'].forecast).toMatchObject({
      expectedBill: 176,
      expectedRange: { low: 153, high: 211 },
      dataQualityTier: 'limited',
      sourceCadence: 'monthly-read',
    });
    expect(
      evaluateForecastUsefulness(scenarios['limited-data']).usefulness
    ).toBe('limited_but_actionable');
    expect(scenarios['cold-start'].forecast.expectedRange).toEqual({
      low: 125,
      high: 218,
    });
    expect(scenarios['cold-start-refined'].forecast.expectedRange).toEqual({
      low: 142,
      high: 205,
    });
    expect(
      scenarios['cold-start-refined'].forecast.expectedRange.high -
        scenarios['cold-start-refined'].forecast.expectedRange.low
    ).toBeLessThan(
      scenarios['cold-start'].forecast.expectedRange.high -
        scenarios['cold-start'].forecast.expectedRange.low
    );
    expect(
      scenarios['forecast-miss'].forecast.forecastMissEvaluation
    ).toMatchObject({
      forecastSurprise: true,
      missDirection: 'upper',
      missAmountBeyondRange: 15,
    });
    expect(scenarios['tariff-preview'].futurePreview).toMatchObject({
      kind: 'tariff',
      currentAnnualCostRange: { low: 2160, high: 2340 },
      alternativeAnnualCostRange: { low: 2010, high: 2220 },
      potentialAnnualBenefit: { low: 90, high: 240 },
      exitFee: 75,
      higherPeakRates: true,
      termMonths: 12,
    });
    expect(scenarios['connected-home-preview'].household).toMatchObject({
      hasEV: true,
      hasSmartThermostat: true,
      hasSolar: false,
      hasBattery: false,
    });
  });

  it('does not duplicate canonical numeric outputs in runtime components', () => {
    const componentFiles = [
      ...readdirSync('components')
        .filter((file) => file.endsWith('.tsx'))
        .map((file) => `components/${file}`),
      ...readdirSync('components/views')
        .filter((file) => file.endsWith('.tsx'))
        .map((file) => `components/views/${file}`),
    ];
    const source = componentFiles
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const forbiddenLiterals = [
      '128.36',
      'expectedBill: 178',
      'low: 171',
      'previousBill || 164',
      'formatCurrencyRange(12, 18)',
      'formatCurrencyRange(15, 22)',
      'formatCurrencyRange(8, 12)',
    ];
    forbiddenLiterals.forEach((literal) =>
      expect(source).not.toContain(literal)
    );
  });
});
