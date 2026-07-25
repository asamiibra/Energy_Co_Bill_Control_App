import type { DemoScenario } from '@/domain/scenario';
import { baselineAlexScenario } from './baseline-alex';

export const connectedHomePreviewScenario: DemoScenario = {
  ...baselineAlexScenario,
  scenarioId: 'connected_home_preview_alex',
  scenarioName: 'Connected-Home Preview',
  recommendations: [
    {
      recommendationId: 'rec-connected-home-preview-001',
      title: 'Preview connected-home coordination',
      description:
        'See how EV and thermostat schedules could be coordinated after governed consent and integration.',
      mode: 'future_governed_action',
      effort: 'medium',
      reversible: true,
      status: 'unavailable',
      requiredConsentPurposes: ['connected_device_access'],
      benefitNotApplicableReason:
        'No benefit is estimated without connected-device consent and governed telemetry.',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-CONNECTED-PREVIEW-001',
    status: 'allow',
    reasonCode: 'none',
    source: 'scenario_fixture',
    supportOptions: ['Review consent and preferences'],
  },
  futurePreview: {
    kind: 'connected-home',
    liveTelemetryAvailable: false,
    personalizedRecommendationsAvailable: false,
    absentConsentPurposes: ['connected_device_access'],
    partnerDependency: 'Approved connected-device integration partner',
  },
};
