import type { DemoScenario } from '@/domain/scenario';

export const baselineAlexScenario: DemoScenario = {
  scenarioId: 'baseline_alex_summer',
  scenarioName: 'Baseline Forecast',
  anchorDate: '2026-07-25',
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
    renewalDaysRemaining: 37,
    recentServiceContact: false,
    dataEligibility: true,
  },
  forecast: {
    forecastVersionId: 'FCST-ALEX-20260725-01',
    generatedAt: '2026-07-25T08:00:00Z',
    billingPeriodStart: '2026-07-03',
    billingPeriodEnd: '2026-08-02',
    billToDate: 128.36,
    expectedBill: 178,
    expectedRange: {
      low: 171,
      high: 204,
    },
    daysRemaining: 8,
    dataQualityTier: 'full',
    sourceCadence: 'interval',
    missingMeterDays: 0,
  },
  drivers: [
    {
      id: 'driver-cooling-001',
      title: 'Cooling use',
      direction: 'up',
      contributionRange: {
        low: 18,
        high: 25,
      },
      explanation: "Cooling use is 14% above Alex's recent normal pattern.",
      source: 'meter',
      asOf: '2026-07-25T08:00:00Z',
    },
    {
      id: 'driver-weather-001',
      title: 'Weather',
      direction: 'up',
      contributionRange: {
        low: 8,
        high: 12,
      },
      explanation:
        'The next seven days are forecast to be warmer than previously expected.',
      source: 'weather',
      asOf: '2026-07-25T08:00:00Z',
    },
    {
      id: 'driver-peak-001',
      title: 'Peak-period usage',
      direction: 'up',
      contributionRange: {
        low: 5,
        high: 9,
      },
      explanation: 'More energy was used during higher-cost periods this week.',
      source: 'meter',
      asOf: '2026-07-25T08:00:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-cooling-adjust-001',
      title: 'Adjust cooling by 2°F for seven days',
      description:
        'Increasing your thermostat temperature by 2°F can reduce cooling costs while maintaining comfort.',
      mode: 'self_directed',
      benefit: {
        low: 12,
        high: 18,
        currency: 'USD',
        basis: 'Estimated based on recent cooling patterns',
        assumptions: [
          'The setting is maintained for seven days',
          'Weather remains broadly consistent with the current forecast',
          'Household occupancy and equipment performance do not materially change',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'low',
      reversible: true,
      status: 'available',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-BASELINE-001',
    status: 'allow',
    reasonCode: 'none',
    source: 'scenario_fixture',
    supportOptions: ['Talk with an advisor', 'Review energy-saving tips'],
  },
  consentState: {
    consentVersionId: 'CONSENT-ALEX-V1',
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
