import { baselineAlexScenario } from './baseline-alex';
import { alertAlexScenario } from './alert-alex';
import { safetyJordanScenario } from './safety-jordan';
import { limitedDataScenario } from './limited-data';
import { coldStartScenario, coldStartRefinedScenario } from './cold-start';
import { forecastMissScenario } from './forecast-miss';
import { consentPreferencesScenario } from './consent';
import { tariffPreviewScenario } from './tariff-preview';
import { connectedHomePreviewScenario } from './connected-home-preview';
import type { DemoScenario } from '@/domain/scenario';

export {
  baselineAlexScenario,
  alertAlexScenario,
  safetyJordanScenario,
  limitedDataScenario,
  coldStartScenario,
  coldStartRefinedScenario,
  forecastMissScenario,
  consentPreferencesScenario,
  tariffPreviewScenario,
  connectedHomePreviewScenario,
};

export const scenarios: Record<string, DemoScenario> = {
  // P0 - 90-second demo path
  baseline: baselineAlexScenario,
  alert: alertAlexScenario,
  safety: safetyJordanScenario,

  // P1 - MVP resilience states
  'limited-data': limitedDataScenario,
  'cold-start': coldStartScenario,
  'cold-start-refined': coldStartRefinedScenario,
  'forecast-miss': forecastMissScenario,
  consent: consentPreferencesScenario,
  'tariff-preview': tariffPreviewScenario,
  'connected-home-preview': connectedHomePreviewScenario,
};

export function getScenario(scenarioId: string): DemoScenario | undefined {
  return scenarios[scenarioId];
}

export function getAllScenarioIds(): string[] {
  return Object.keys(scenarios);
}

export function getP0ScenarioIds(): string[] {
  return ['baseline', 'alert', 'safety'];
}

export function getP1ScenarioIds(): string[] {
  return [
    'limited-data',
    'cold-start',
    'cold-start-refined',
    'forecast-miss',
    'consent',
  ];
}

export function getP2ScenarioIds(): string[] {
  return ['tariff-preview', 'connected-home-preview'];
}
