import type { DemoScenario } from '@/domain/scenario';

export const alertAlexScenario: DemoScenario = {
  scenarioId: 'alert_alex_late_summer',
  scenarioName: 'Material-Change Alert',
  anchorDate: '2026-08-25',
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
    renewalDaysRemaining: 6,
    recentServiceContact: false,
    dataEligibility: true,
    usageVariancePercent: 18,
  },
  previousForecast: {
    forecastVersionId: 'FCST-ALEX-20260821-01',
    generatedAt: '2026-08-21T08:00:00Z',
    billingPeriodStart: '2026-08-03',
    billingPeriodEnd: '2026-09-02',
    billToDate: 98.5,
    expectedBill: 164,
    expectedRange: {
      low: 154,
      high: 181,
    },
    daysRemaining: 12,
    dataQualityTier: 'full',
    sourceCadence: 'interval',
    missingMeterDays: 0,
  },
  forecast: {
    forecastVersionId: 'FCST-ALEX-20260825-02',
    generatedAt: '2026-08-25T08:00:00Z',
    billingPeriodStart: '2026-08-03',
    billingPeriodEnd: '2026-09-02',
    billToDate: 142.8,
    expectedBill: 186,
    expectedRange: {
      low: 168,
      high: 204,
    },
    daysRemaining: 8,
    dataQualityTier: 'limited',
    sourceCadence: 'interval',
    missingMeterDays: 2,
    materialChangeReasons: [
      'point_estimate_movement',
      'range_width_increase',
      'data_quality_degradation',
    ],
  },
  drivers: [
    {
      id: 'driver-cooling-002',
      title: 'Cooling use',
      direction: 'up',
      contributionRange: {
        low: 22,
        high: 30,
      },
      explanation:
        'Recent cooling use was higher than expected for this period.',
      source: 'meter',
      asOf: '2026-08-25T08:00:00Z',
    },
    {
      id: 'driver-weather-002',
      title: 'Weather',
      direction: 'up',
      contributionRange: {
        low: 10,
        high: 15,
      },
      explanation:
        'The seven-day weather forecast became warmer than the previous forecast.',
      source: 'weather',
      asOf: '2026-08-25T08:00:00Z',
    },
    {
      id: 'driver-missing-data-001',
      title: 'Missing data',
      direction: 'neutral',
      explanation:
        'Two days of meter data are missing, so the estimate uses a wider range.',
      source: 'meter',
      asOf: '2026-08-25T08:00:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-cooling-schedule-001',
      title: 'Adjust cooling schedule',
      description:
        'Adjust your thermostat to reduce cooling during the remaining billing period.',
      mode: 'self_directed',
      benefit: {
        low: 15,
        high: 22,
        currency: 'USD',
        basis: 'Directional estimate based on remaining billing days',
        assumptions: [
          'Maintain the schedule for the remaining billing period',
          'Weather remains consistent with current forecast',
          'No significant changes in household patterns',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'low',
      reversible: true,
      status: 'available',
    },
    {
      recommendationId: 'rec-laundry-shift-001',
      title: 'Shift laundry to off-peak hours',
      description:
        'Running laundry during lower-cost periods can reduce your bill.',
      mode: 'self_directed',
      benefit: {
        low: 8,
        high: 12,
        currency: 'USD',
        basis: 'Based on tariff structure and typical laundry loads',
        assumptions: [
          'Complete four loads during lower-cost periods',
          'Typical load size and frequency',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'medium',
      reversible: true,
      status: 'available',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-ALERT-001',
    status: 'allow',
    reasonCode: 'none',
    source: 'scenario_fixture',
    supportOptions: ['Talk with an advisor', 'Review budget plan options'],
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
