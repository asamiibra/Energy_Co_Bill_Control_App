import type { DemoScenario } from '@/domain/scenario';

export const forecastMissScenario: DemoScenario = {
  scenarioId: 'forecast_miss_alex_closed_bill',
  scenarioName: 'Forecast-Miss Recovery',
  anchorDate: '2026-08-05', // Billing closed 3 days ago
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
  // Last communicated forecast (4 days before billing close)
  previousForecast: {
    forecastVersionId: 'FCST-ALEX-MISS-01',
    generatedAt: '2026-07-29T08:00:00Z', // 4 days before close
    billingPeriodStart: '2026-07-03',
    billingPeriodEnd: '2026-08-02',
    billToDate: 145.8,
    expectedBill: 174,
    expectedRange: {
      low: 160,
      high: 192,
    },
    daysRemaining: 4,
    dataQualityTier: 'full',
    sourceCadence: 'interval',
    missingMeterDays: 0,
    communicationStatus: 'communicated',
    eligibleAtCommunication: true,
  },
  // Final bill information
  forecast: {
    forecastVersionId: 'BILL-ALEX-MISS-01', // Final bill record
    generatedAt: '2026-08-02T23:59:59Z', // Billing close
    billingPeriodStart: '2026-07-03',
    billingPeriodEnd: '2026-08-02',
    billToDate: 207, // This is the final bill
    expectedBill: 207, // Same as final bill
    expectedRange: {
      low: 207,
      high: 207, // Final bill - no range
    },
    daysRemaining: 0,
    dataQualityTier: 'full',
    sourceCadence: 'final-bill',
    missingMeterDays: 0,
    billingStatus: 'closed',
    finalBill: 207,
    forecastMissEvaluation: {
      forecastSurprise: true,
      missDirection: 'upper',
      missAmountBeyondRange: 15, // $207 - $192 = $15
      lastValidCommunicatedRange: { low: 160, high: 192 },
      lastCommunicatedAt: '2026-07-29T08:00:00Z',
      billingCloseAt: '2026-08-02T23:59:59Z',
      hoursBeforeClose: 96, // 4 days
      evaluationValid: true,
    },
  },
  drivers: [
    {
      id: 'driver-late-heatwave-001',
      title: 'Late heatwave',
      direction: 'up',
      contributionRange: {
        low: 12,
        high: 18,
      },
      explanation:
        'A late heatwave occurred after the final forecast update on July 29.',
      source: 'weather-post-analysis',
      asOf: '2026-08-05T08:00:00Z',
    },
    {
      id: 'driver-equipment-usage-001',
      title: 'Equipment usage',
      direction: 'up',
      contributionRange: {
        low: 8,
        high: 12,
      },
      explanation:
        'Heat pump usage increased significantly during the final three days.',
      source: 'meter-post-analysis',
      asOf: '2026-08-05T08:00:00Z',
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-advisory-support-001',
      title: 'Talk with an advisor',
      description:
        'Discuss how range improvements will affect future estimates.',
      mode: 'advisor_assisted',
      effort: 'low',
      reversible: true,
      status: 'available',
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-FORECAST-MISS-001',
    status: 'allow',
    reasonCode: 'transparent_recovery',
    source: 'forecast_miss_policy',
    customerMessage:
      'Your final bill was outside the range we previously showed.',
    supportOptions: [
      'Review what changed',
      'How Bill Control will improve',
      'Talk with an advisor',
    ],
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
