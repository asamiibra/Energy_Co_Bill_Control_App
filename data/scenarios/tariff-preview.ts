import type { DemoScenario } from '@/domain/scenario';
import { baselineAlexScenario } from './baseline-alex';

export const tariffPreviewScenario: DemoScenario = {
  ...baselineAlexScenario,
  scenarioId: 'tariff_preview_alex',
  scenarioName: 'Tariff-Fit Preview',
  recommendations: [
    {
      recommendationId: 'rec-tariff-switch-preview-001',
      title: 'Preview a tariff switch',
      description:
        'Review the assumptions, contract terms, and trade-offs before any future confirmation.',
      mode: 'future_governed_action',
      effort: 'medium',
      reversible: false,
      status: 'future',
      requiredConsentPurposes: ['tariff_recommendation'],
      benefitNotApplicableReason:
        'Potential annual benefit is represented by the governed preview, not an executable MVP action.',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-TARIFF-PREVIEW-001',
    status: 'allow',
    reasonCode: 'none',
    source: 'scenario_fixture',
    supportOptions: ['Talk with an advisor'],
  },
  futurePreview: {
    kind: 'tariff',
    currentAnnualCostRange: { low: 2160, high: 2340 },
    alternativeAnnualCostRange: { low: 2010, high: 2220 },
    potentialAnnualBenefit: { low: 90, high: 240 },
    exitFee: 75,
    higherPeakRates: true,
    termMonths: 12,
    assumptions: [
      'Annual usage follows the approved synthetic household profile',
      'Tariff rates and fees remain unchanged for the comparison period',
      'Actual cost depends on when energy is used',
    ],
  },
};
