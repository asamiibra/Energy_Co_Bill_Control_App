import type { DemoScenario } from '@/domain/scenario';

export const consentPreferencesScenario: DemoScenario = {
  scenarioId: 'consent_preferences_alex',
  scenarioName: 'Consent and Preferences',
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
    forecastVersionId: 'FCST-ALEX-CONSENT-20260725-01',
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
      id: 'driver-consent-cooling-001',
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
      id: 'driver-consent-weather-001',
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
  ],
  recommendations: [
    {
      recommendationId: 'rec-consent-cooling-001',
      title: 'Adjust cooling by 2°F for seven days',
      description:
        'Increasing your thermostat temperature by 2°F can reduce cooling costs.',
      mode: 'self_directed',
      benefit: {
        low: 12,
        high: 18,
        currency: 'USD',
        basis: 'Estimated based on recent cooling patterns',
        assumptions: [
          'The setting is maintained for seven days',
          'Weather remains broadly consistent with the current forecast',
          'Household occupancy patterns remain similar',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'low',
      reversible: true,
      status: 'available',
      requiredConsentPurposes: [], // No special consent required for this basic action
    },
    {
      recommendationId: 'rec-consent-thermostat-001',
      title: 'Optimize smart thermostat schedule',
      description:
        'Use connected device data to fine-tune your cooling schedule.',
      mode: 'self_directed',
      benefit: {
        low: 8,
        high: 15,
        currency: 'USD',
        basis: 'Based on device connectivity and usage patterns',
        assumptions: [
          'Connected device access is granted',
          'Smart thermostat remains connected',
          'Schedule optimization maintained',
        ],
        confidenceLabel: 'directional',
      },
      effort: 'low',
      reversible: true,
      status: 'unavailable', // Requires connected device consent
      requiredConsentPurposes: ['connected_device_access'],
    },
  ],
  safetyDecision: {
    policyDecisionId: 'POLICY-ALEX-CONSENT-001',
    status: 'allow',
    reasonCode: 'none',
    source: 'scenario_fixture',
    supportOptions: ['Talk with an advisor', 'Review privacy policy'],
  },
  consentState: {
    consentVersionId: 'CONSENT-ALEX-V3',
    permissions: [
      {
        purpose: 'interval_meter_personalization',
        status: 'granted',
        grantedAt: '2026-07-01T10:00:00Z',
        description:
          'Use detailed meter data to personalize your bill forecasts and recommendations',
        dataUsed: 'Hourly and daily energy usage patterns, peak usage times',
        benefit:
          'More accurate forecasts and personalized energy-saving recommendations',
        required: false,
        revokeImpact:
          'Bill Control will use billing history, weather, and tariff information instead. Your expected range may become wider.',
      },
      {
        purpose: 'bill_alert_reminders',
        status: 'granted',
        grantedAt: '2026-07-01T10:00:00Z',
        description:
          'Send proactive notifications when your bill estimate changes significantly',
        dataUsed: 'Forecast changes, billing dates, contact preferences',
        benefit: 'Stay informed about bill changes before billing closes',
        required: false,
        revokeImpact:
          'You will no longer receive proactive bill-change reminders. You can still view Bill Control when you sign in.',
      },
      {
        purpose: 'advisor_follow_up',
        status: 'declined',
        declinedAt: '2026-07-01T10:00:00Z',
        description:
          'Allow energy advisors to contact you with personalized recommendations',
        dataUsed: 'Account information, usage patterns, previous interactions',
        benefit: 'Receive expert guidance tailored to your household',
        required: false,
        revokeImpact:
          'Advisors will not proactively contact you, but you can still request support.',
      },
      {
        purpose: 'connected_device_access',
        status: 'not_requested',
        description:
          'Access smart home device data for enhanced recommendations',
        dataUsed:
          'Thermostat settings, schedules, device status and usage patterns',
        benefit: 'More precise recommendations based on actual device behavior',
        required: false,
        revokeImpact:
          'Bill Control will not access connected-device information or offer device-based actions.',
      },
      {
        purpose: 'tariff_recommendation',
        status: 'declined',
        declinedAt: '2026-07-01T10:00:00Z',
        description: 'Analyze your usage to recommend alternative energy plans',
        dataUsed: 'Usage patterns, billing history, available tariff options',
        benefit: 'Discover if a different energy plan could save you money',
        required: false,
        revokeImpact:
          'Bill Control will not use your account context to recommend alternative tariffs.',
      },
      {
        purpose: 'partner_referral',
        status: 'declined',
        declinedAt: '2026-07-01T10:00:00Z',
        description:
          'Share anonymized usage data with approved energy service partners',
        dataUsed:
          'Anonymized usage patterns, home characteristics, location data',
        benefit: 'Access to partner offers for energy efficiency improvements',
        required: false,
        revokeImpact:
          'You will not receive partner offers or energy efficiency recommendations from third parties.',
      },
    ],
  },
};
