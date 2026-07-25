import type { DemoScenario } from '@/domain/scenario';

export const safetyJordanScenario: DemoScenario = {
  scenarioId: 'safety_jordan_winter',
  scenarioName: 'Safety Guardrail',
  anchorDate: '2026-01-15',
  household: {
    customerId: 'CUST-JORDAN-001',
    customerName: 'Jordan Lee',
    address: '62 Willow Court',
    householdSize: 2,
    homeType: 'apartment',
    heatingType: 'electric',
    hasEV: false,
    hasSolar: false,
    hasBattery: false,
    hasSmartThermostat: false,
    tariffName: 'Standard Residential',
  },
  cohortContext: {
    billVolatility: 'medium',
    recentServiceContact: false,
    dataEligibility: true,
  },
  forecast: {
    forecastVersionId: 'FCST-JORDAN-20260115-01',
    generatedAt: '2026-01-15T08:00:00Z',
    billingPeriodStart: '2026-01-05',
    billingPeriodEnd: '2026-02-04',
    billToDate: 145.2,
    expectedBill: 220,
    expectedRange: {
      low: 205,
      high: 240,
    },
    daysRemaining: 20,
    dataQualityTier: 'full',
    sourceCadence: 'interval',
    missingMeterDays: 0,
  },
  drivers: [
    {
      id: 'driver-heating-001',
      title: 'Heating use',
      direction: 'up',
      contributionRange: {
        low: 35,
        high: 45,
      },
      explanation:
        'Heating use is elevated due to colder-than-average temperatures.',
      source: 'meter',
      asOf: '2026-01-15T08:00:00Z',
    },
    {
      id: 'driver-weather-winter-001',
      title: 'Winter weather',
      direction: 'up',
      contributionRange: {
        low: 15,
        high: 22,
      },
      explanation: 'Extended cold period is forecast for the next two weeks.',
      source: 'weather',
      asOf: '2026-01-15T08:00:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-heating-reduce-suppressed',
      title: 'Reduce essential heating overnight',
      description:
        'This recommendation has been suppressed due to essential-use protection.',
      mode: 'self_directed',
      // No benefit shown for suppressed recommendations
      effort: 'low',
      reversible: true,
      status: 'suppressed',
      policyDecisionId: 'POLICY-JORDAN-ESSENTIAL-001',
    },
    {
      recommendationId: 'rec-support-001',
      title: 'Talk with an advisor',
      description:
        'Discuss budget plan options and energy assistance programs.',
      mode: 'advisor_assisted',
      effort: 'low',
      reversible: true,
      status: 'available',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-JORDAN-ESSENTIAL-001',
    status: 'suppress',
    reasonCode: 'essential_use_protection',
    source: 'customer_declared',
    customerMessage:
      'We are not recommending a reduction in essential heating under current conditions.',
    supportOptions: [
      'Review available support options',
      'Check budget-plan eligibility',
      'Review a support tariff',
      'Speak with an advisor',
      'View safe alternatives',
    ],
  },
  consentState: {
    consentVersionId: 'CONSENT-JORDAN-V1',
    permissions: [
      {
        purpose: 'interval_meter_personalization',
        status: 'granted',
        grantedAt: '2026-01-05T12:00:00Z',
      },
      {
        purpose: 'bill_alert_reminders',
        status: 'granted',
        grantedAt: '2026-01-05T12:00:00Z',
      },
      {
        purpose: 'advisor_follow_up',
        status: 'granted',
        grantedAt: '2026-01-05T12:00:00Z',
      },
      {
        purpose: 'connected_device_access',
        status: 'not_requested',
      },
      {
        purpose: 'tariff_recommendation',
        status: 'not_requested',
      },
      {
        purpose: 'partner_referral',
        status: 'not_requested',
      },
    ],
  },
};
