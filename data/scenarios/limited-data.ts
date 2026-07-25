import type { DemoScenario } from '@/domain/scenario';

export const limitedDataScenario: DemoScenario = {
  scenarioId: 'limited_data_alex_monthly_read',
  scenarioName: 'Limited-Data Mode',
  anchorDate: '2026-09-23',
  household: {
    customerId: 'CUST-ALEX-001',
    customerName: 'Alex Morgan',
    address: '1847 Cedar Lane',
    householdSize: 3,
    homeType: 'detached',
    heatingType: 'heat-pump',
    hasEV: true,
    hasSolar: false,
    hasBattery: false,
    hasSmartThermostat: true,
    tariffName: 'Standard Flex',
    renewalDate: '2026-08-31',
  },
  cohortContext: {
    billVolatility: 'high',
    recentServiceContact: false,
    dataEligibility: true,
  },
  forecast: {
    forecastVersionId: 'FCST-ALEX-LIMITED-20260918-01',
    generatedAt: '2026-09-18T08:00:00Z',
    billingPeriodStart: '2026-09-03',
    billingPeriodEnd: '2026-10-02',
    billToDate: 121.4,
    expectedBill: 176,
    expectedRange: {
      low: 153,
      high: 211,
    },
    daysRemaining: 9,
    dataQualityTier: 'limited',
    sourceCadence: 'monthly-read',
    missingMeterDays: 0, // All interval readings unavailable, only monthly reads
    intervalDataAvailable: false,
  },
  drivers: [
    {
      id: 'driver-billing-history-001',
      title: 'Billing history',
      direction: 'neutral',
      explanation:
        'Estimate based on previous September billing patterns for this household.',
      source: 'billing-history',
      asOf: '2026-09-18T08:00:00Z',
    },
    {
      id: 'driver-weather-seasonal-001',
      title: 'Weather',
      direction: 'neutral',
      explanation:
        'September weather patterns are within normal seasonal range.',
      source: 'weather',
      asOf: '2026-09-18T08:00:00Z',
    },
    {
      id: 'driver-tariff-001',
      title: 'Tariff structure',
      direction: 'neutral',
      explanation:
        'Standard Flex tariff rates applied to historical usage patterns.',
      source: 'tariff',
      asOf: '2026-09-18T08:00:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-cooling-schedule-limited-001',
      title: 'Review your cooling schedule for the remaining billing period',
      description:
        'Adjusting your cooling schedule can help manage costs during the remaining 9 days.',
      mode: 'self_directed',
      benefit: {
        low: 5,
        high: 15,
        currency: 'USD',
        basis: 'Directional estimate based on typical cooling adjustments',
        assumptions: [
          'Schedule maintained for remaining billing period',
          'Weather remains within seasonal norms',
          'Household occupancy patterns remain similar',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'low',
      reversible: true,
      status: 'available',
      usefulnessThreshold: 'limited_but_actionable',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-LIMITED-DATA-001',
    status: 'allow',
    reasonCode: 'limited_but_actionable',
    source: 'usefulness_evaluation',
    supportOptions: [
      'Talk with an advisor',
      'Request interval-data evaluation',
      'Review energy-saving tips',
    ],
  },
  consentState: {
    consentVersionId: 'CONSENT-ALEX-V2',
    permissions: [
      {
        purpose: 'interval_meter_personalization',
        status: 'granted',
        grantedAt: '2026-07-01T10:00:00Z',
      },
      {
        purpose: 'bill_alert_reminders',
        status: 'granted',
        grantedAt: '2026-07-01T10:00:00Z',
      },
      {
        purpose: 'advisor_follow_up',
        status: 'declined',
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
        status: 'declined',
      },
    ],
  },
};
