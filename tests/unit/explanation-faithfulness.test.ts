import { describe, expect, it } from 'vitest';

import { scenarios } from '@/data/scenarios';
import { buildEvidenceLedger } from '@/services/explanation-evidence-ledger';
import { validateExplanationFaithfulness } from '@/services/explanation-faithfulness-validator';

describe('explanation faithfulness', () => {
  it('accepts a complete approved baseline explanation', () => {
    const ledger = buildEvidenceLedger(scenarios.baseline);
    const result = validateExplanationFaithfulness(
      {
        summary: 'Approved forecast explanation',
        drivers: ledger.drivers.map((driver) => driver.explanation),
        numericClaims: [
          { value: 178, context: 'expectedBill' },
          { value: 171, context: 'expectedRangeLow' },
          { value: 204, context: 'expectedRangeHigh' },
        ],
        driverClaims: ledger.drivers.map((driver) => ({
          id: driver.id,
          direction: driver.direction,
          contributionRange: driver.contributionRange,
        })),
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
        forecastVersionId: ledger.forecastVersionId,
        dataQualityTier: ledger.dataQualityTier,
        policyDecisionId: ledger.policyDecisionId,
        assumptions: ledger.recommendations.flatMap(
          (recommendation) => recommendation.benefit?.assumptions ?? []
        ),
      },
      ledger
    );
    expect(result.isValid).toBe(true);
  });

  it.each([
    [
      'altered number',
      { numericClaims: [{ value: 179, context: 'expectedBill' }] },
    ],
    [
      'unsupported driver',
      {
        drivers: ['Solar generation reduced your bill'],
        driverClaims: [{ id: 'invented-solar', direction: 'down' as const }],
      },
    ],
    [
      'altered magnitude',
      {
        driverClaims: [
          {
            id: 'driver-cooling-001',
            direction: 'up' as const,
            contributionRange: { low: 1, high: 2 },
          },
        ],
      },
    ],
    ['guaranteed savings', { summary: 'Guaranteed savings are available.' }],
    ['executed action', { summary: 'The action has been executed.' }],
    ['partner transfer', { summary: 'We shared your data with a partner.' }],
    ['live telemetry', { summary: 'Live device telemetry confirms this.' }],
  ])('rejects %s', (_name, override) => {
    const ledger = buildEvidenceLedger(scenarios.baseline);
    const result = validateExplanationFaithfulness(
      {
        summary: 'Approved summary',
        drivers: [],
        ...override,
      },
      ledger
    );
    expect(result.isValid).toBe(false);
  });

  it('rejects hidden tariff disadvantages and executable future status', () => {
    const ledger = buildEvidenceLedger(scenarios['tariff-preview']);
    const result = validateExplanationFaithfulness(
      {
        summary: 'A different tariff may lower annual cost.',
        drivers: [],
      },
      ledger
    );
    expect(result.failedRules).toEqual(
      expect.arrayContaining([
        'Tariff explanation omits contract terms and exit fee',
        'Future action status is missing or executable',
      ])
    );
  });

  it('rejects nonexistent household assets', () => {
    const ledger = buildEvidenceLedger(scenarios['connected-home-preview']);
    const result = validateExplanationFaithfulness(
      {
        summary: 'Preview only',
        drivers: [],
        deviceClaims: [{ asset: 'solar', present: true }],
        futureActionStatus: 'not_available_in_mvp',
      },
      ledger
    );
    expect(result.failedRules).toContain(
      'Device asset solar does not match ledger'
    );
  });
});
