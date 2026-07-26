import { getScenario } from '@/data/scenarios';
import type { DemoScenario } from '@/domain/scenario';

export type ScenarioId =
  | 'baseline'
  | 'alert'
  | 'safety'
  | 'limited-data'
  | 'cold-start'
  | 'cold-start-refined'
  | 'forecast-miss'
  | 'consent'
  | 'tariff-preview'
  | 'connected-home-preview';

/**
 * Scenario router utilities for handling URL-based scenario switching
 */

export function getScenarioFromUrl(
  searchParams: URLSearchParams
): DemoScenario | null {
  const scenarioId = searchParams.get('scenario');

  if (!scenarioId) {
    return getScenario('baseline') || null;
  }

  return getScenario(scenarioId) || null;
}

export function buildScenarioUrl(
  scenarioId: string,
  baseUrl: string = '/',
  presentation = false
): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('scenario', scenarioId);
  if (presentation) {
    url.searchParams.set('presentation', 'true');
  }
  return url.pathname + url.search;
}

export function navigateToScenario(
  scenarioId: ScenarioId,
  presentation = false
): void {
  const url = buildScenarioUrl(scenarioId, window.location.href, presentation);
  window.history.pushState(null, '', url);
  window.dispatchEvent(new Event('bill-control:route-change'));
}

export function isValidScenarioId(
  scenarioId: string
): scenarioId is ScenarioId {
  const validIds: ScenarioId[] = [
    'baseline',
    'alert',
    'safety',
    'limited-data',
    'cold-start',
    'cold-start-refined',
    'forecast-miss',
    'consent',
    'tariff-preview',
    'connected-home-preview',
  ];

  return validIds.includes(scenarioId as ScenarioId);
}

export function getScenarioDisplayName(scenarioId: string): string {
  const displayNames: Record<string, string> = {
    baseline: 'Baseline Forecast',
    alert: 'Material-Change Alert',
    safety: 'Safety Guardrail',
    'limited-data': 'Limited-Data Mode',
    'cold-start': 'New-Customer Cold Start',
    'cold-start-refined': 'Cold Start (Refined)',
    'forecast-miss': 'Forecast-Miss Recovery',
    consent: 'Consent and Preferences',
    'tariff-preview': 'Tariff-Fit Preview',
    'connected-home-preview': 'Connected-Home Preview',
  };

  return displayNames[scenarioId] || scenarioId;
}

export function getAvailableScenarios(): Array<{
  id: ScenarioId;
  name: string;
  available: boolean;
  group: 'P0' | 'P1' | 'Future';
}> {
  return [
    // P0 - 90-second demo path
    { id: 'baseline', name: 'Baseline Forecast', available: true, group: 'P0' },
    {
      id: 'alert',
      name: 'Material-Change Alert',
      available: true,
      group: 'P0',
    },
    { id: 'safety', name: 'Safety Guardrail', available: true, group: 'P0' },

    // P1 - MVP resilience states
    {
      id: 'limited-data',
      name: 'Limited-Data Mode',
      available: true,
      group: 'P1',
    },
    {
      id: 'cold-start',
      name: 'New-Customer Cold Start',
      available: true,
      group: 'P1',
    },
    {
      id: 'forecast-miss',
      name: 'Forecast-Miss Recovery',
      available: true,
      group: 'P1',
    },
    {
      id: 'consent',
      name: 'Consent and Preferences',
      available: true,
      group: 'P1',
    },

    // Future - P2 expansions
    {
      id: 'tariff-preview',
      name: 'Tariff-Fit Preview',
      available: true,
      group: 'Future',
    },
    {
      id: 'connected-home-preview',
      name: 'Connected-Home Preview',
      available: true,
      group: 'Future',
    },
  ];
}
