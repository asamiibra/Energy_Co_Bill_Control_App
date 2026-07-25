import type { DemoScenario } from '@/domain/scenario';

export const coldStartScenario: DemoScenario = {
  scenarioId: 'cold_start_taylor_new_customer',
  scenarioName: 'New-Customer Cold Start',
  anchorDate: '2026-07-15',
  household: {
    customerId: 'CUST-TAYLOR-001',
    customerName: 'Taylor Brooks',
    address: '905 Lakeview Drive',
    householdSize: undefined, // Initially unknown
    homeType: 'townhome',
    heatingType: undefined, // Initially unknown
    hasEV: undefined, // Initially unknown
    hasSolar: undefined, // Initially unknown
    hasBattery: undefined, // Initially unknown
    hasSmartThermostat: undefined, // Initially unknown
    tariffName: 'Standard Residential',
  },
  cohortContext: {
    billVolatility: 'unknown',
    recentServiceContact: false,
    dataEligibility: true,
    newCustomer: true,
    householdHistoryDays: 0,
  },
  forecast: {
    forecastVersionId: 'FCST-TAYLOR-COHORT-20260715-01',
    generatedAt: '2026-07-15T10:30:00Z',
    billingPeriodStart: '2026-07-05',
    billingPeriodEnd: '2026-08-04',
    billToDate: 45.2,
    expectedBill: 165,
    expectedRange: {
      low: 125,
      high: 218,
    },
    daysRemaining: 20, // July 15 to Aug 4 = 20 days
    dataQualityTier: 'limited',
    sourceCadence: 'cohort-based',
    missingMeterDays: 0,
    cohortBased: true,
  },
  drivers: [
    {
      id: 'driver-cohort-001',
      title: 'Similar homes',
      direction: 'neutral',
      explanation:
        'Estimate based on similar townhomes in your area during July.',
      source: 'cohort-analysis',
      asOf: '2026-07-10T10:30:00Z',
    },
    {
      id: 'driver-weather-july-001',
      title: 'Local weather',
      direction: 'neutral',
      explanation: 'July weather patterns are typical for your location.',
      source: 'weather',
      asOf: '2026-07-10T10:30:00Z',
    },
    {
      id: 'driver-tariff-new-001',
      title: 'Selected tariff',
      direction: 'neutral',
      explanation:
        'Standard Residential tariff rates applied to cohort usage patterns.',
      source: 'tariff',
      asOf: '2026-07-10T10:30:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-bill-alert-setup-001',
      title:
        'Set a bill-alert preference while Bill Control learns your household pattern',
      description:
        'Get notified when your estimate changes significantly as we learn more about your usage.',
      mode: 'self_directed',
      // No savings estimate for cold-start state
      effort: 'low',
      reversible: true,
      status: 'available',
      usefulnessThreshold: 'limited_but_actionable',
      requiresColdStartRefinement: false,
      benefitNotApplicableReason:
        'Reminder setup has no customer savings estimate.',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-TAYLOR-COLD-START-001',
    status: 'allow',
    reasonCode: 'cold_start_limited_actions',
    source: 'new_customer_policy',
    supportOptions: [
      'Talk with an advisor',
      'Review new customer guide',
      'Learn about energy-saving tips',
    ],
  },
  consentState: {
    consentVersionId: 'CONSENT-TAYLOR-V1',
    permissions: [
      {
        purpose: 'interval_meter_personalization',
        status: 'not_requested',
      },
      {
        purpose: 'bill_alert_reminders',
        status: 'not_requested',
      },
      {
        purpose: 'advisor_follow_up',
        status: 'not_requested',
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

// Refined variant after optional answers provided
export const coldStartRefinedScenario: DemoScenario = {
  ...coldStartScenario,
  scenarioId: 'cold_start_taylor_refined',
  household: {
    ...coldStartScenario.household,
    householdSize: 3,
    heatingType: 'heat-pump',
    hasEV: true,
    hasSolar: false,
    hasBattery: false,
    hasSmartThermostat: true,
  },
  forecast: {
    ...coldStartScenario.forecast,
    forecastVersionId: 'FCST-TAYLOR-REFINED-20260715-02',
    expectedBill: 172,
    expectedRange: {
      low: 142,
      high: 205,
    },
  },
  drivers: [
    {
      id: 'driver-refined-cohort-001',
      title: 'Similar homes',
      direction: 'neutral',
      explanation:
        'Estimate refined using 3-person households with heat pumps and EVs.',
      source: 'refined-cohort-analysis',
      asOf: '2026-07-15T10:45:00Z',
    },
    {
      id: 'driver-heat-pump-001',
      title: 'Heat pump usage',
      direction: 'neutral',
      explanation: 'July heat pump patterns for similar households.',
      source: 'equipment-cohort',
      asOf: '2026-07-15T10:45:00Z',
    },
    {
      id: 'driver-ev-charging-001',
      title: 'EV charging',
      direction: 'up',
      contributionRange: {
        low: 15,
        high: 25,
      },
      explanation: 'Electric vehicle charging adds to typical household usage.',
      source: 'equipment-cohort',
      asOf: '2026-07-15T10:45:00Z',
    },
  ],
};
