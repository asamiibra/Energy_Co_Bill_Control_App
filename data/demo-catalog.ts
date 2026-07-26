import {
  alertAlexScenario,
  baselineAlexScenario,
  safetyJordanScenario,
} from '@/data/scenarios';
import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';

const safetyMessage =
  safetyJordanScenario.safetyDecision.reasonCode === 'essential_use_protection'
    ? 'Essential-use protection is active. Bill Control has withheld recommendations that could reduce essential heating.'
    : '';

export const primaryDemoScenarios = [
  {
    id: 'baseline',
    sequence: 1,
    name: 'Baseline Forecast',
    question: 'Where is my bill heading?',
    proof:
      'Bill Control communicates an expected range, explains the main drivers and offers one safe action before the billing period closes.',
    message: `Your expected bill is ${formatCurrency(
      baselineAlexScenario.forecast.expectedBill,
      { includeDecimals: false }
    )}, with an expected range of ${formatCurrencyRange(
      baselineAlexScenario.forecast.expectedRange.low,
      baselineAlexScenario.forecast.expectedRange.high
    )}. You have ${baselineAlexScenario.forecast.daysRemaining} days remaining.`,
    cta: 'Open Baseline Forecast',
  },
  {
    id: 'alert',
    sequence: 2,
    name: 'Material-Change Alert',
    question: 'What changed—and what can I still do?',
    proof:
      'Bill Control exposes the previous and revised estimates, explains missing data and lets the customer respond before the bill is fixed.',
    message: `Your expected bill has changed from ${formatCurrency(
      alertAlexScenario.previousForecast?.expectedBill ?? 0,
      { includeDecimals: false }
    )} to ${formatCurrency(alertAlexScenario.forecast.expectedBill, {
      includeDecimals: false,
    })}. Recent cooling use, warmer weather and missing meter data are the main drivers.`,
    cta: 'Open Material-Change Alert',
  },
  {
    id: 'safety',
    sequence: 3,
    name: 'Safety Guardrail',
    question: 'What happens when a recommendation could be unsafe?',
    proof:
      'Essential-use policy overrides optimization, suppresses the recommendation and routes the customer to safe support.',
    message: safetyMessage,
    cta: 'Open Safety Guardrail',
  },
] as const;

export const secondaryDemoGroups = [
  {
    id: 'resilience',
    title: 'MVP resilience states',
    scenarios: [
      {
        id: 'limited-data',
        name: 'Limited-Data Mode',
        question:
          'How does Bill Control respond when recent meter data is incomplete?',
      },
      {
        id: 'cold-start',
        name: 'New-Customer Cold Start',
        question:
          'How does Bill Control help before a customer has a usage history?',
      },
      {
        id: 'forecast-miss',
        name: 'Forecast-Miss Recovery',
        question:
          'What happens when the final bill falls outside the communicated range?',
      },
      {
        id: 'consent',
        name: 'Consent and Preferences',
        question:
          'How can a customer control personalization and follow-up permissions?',
      },
    ],
  },
  {
    id: 'future',
    title: 'Future expansion previews',
    scenarios: [
      {
        id: 'tariff-preview',
        name: 'Tariff-Fit Preview',
        question:
          'How could Bill Control compare tariff fit without enabling a switch?',
      },
      {
        id: 'connected-home-preview',
        name: 'Connected-Home Preview',
        question:
          'What consent and partner controls would connected-home guidance require?',
      },
    ],
  },
] as const;
