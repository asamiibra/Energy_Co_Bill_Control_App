'use client';

import { BaselineForecastView } from './views/baseline-forecast-view';
import { MaterialChangeAlertView } from './views/material-change-alert-view';
import { SafetyGuardrailView } from './views/safety-guardrail-view';
import { LimitedDataModeView } from './views/limited-data-mode-view';
import { ColdStartView } from './views/cold-start-view';
import { ForecastMissView } from './views/forecast-miss-view';
import { ConsentPreferencesView } from './views/consent-preferences-view';
import { TariffPreviewView } from './views/tariff-preview-view';
import { ConnectedHomePreviewView } from './views/connected-home-preview-view';

import type { DemoScenario } from '@/domain/scenario';

interface ScenarioDisplayProps {
  scenario: DemoScenario;
}

export function ScenarioDisplay({ scenario }: ScenarioDisplayProps) {
  // Route to appropriate view based on scenario
  switch (scenario.scenarioId) {
    // P0 - 90-second demo path
    case 'baseline_alex_summer':
      return <BaselineForecastView scenario={scenario} />;

    case 'alert_alex_late_summer':
      return <MaterialChangeAlertView scenario={scenario} />;

    case 'safety_jordan_winter':
      return <SafetyGuardrailView scenario={scenario} />;

    // P1 - MVP resilience states
    case 'limited_data_alex_monthly_read':
      return <LimitedDataModeView scenario={scenario} />;

    case 'cold_start_taylor_new_customer':
    case 'cold_start_taylor_refined':
      return <ColdStartView scenario={scenario} />;

    case 'forecast_miss_alex_closed_bill':
      return <ForecastMissView scenario={scenario} />;

    case 'consent_preferences_alex':
      return <ConsentPreferencesView scenario={scenario} />;

    case 'tariff_preview_alex':
      return <TariffPreviewView scenario={scenario} />;

    case 'connected_home_preview_alex':
      return <ConnectedHomePreviewView scenario={scenario} />;

    default:
      return (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              {scenario.scenarioName}
            </h2>
            <p className="mb-4 text-gray-600">
              This scenario view is not yet implemented.
            </p>

            {/* Basic diagnostic information */}
            <div className="rounded-md bg-gray-50 p-4 text-left">
              <h3 className="mb-2 font-medium text-gray-900">
                Scenario Summary
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Scenario ID:</strong> {scenario.scenarioId}
                </div>
                <div>
                  <strong>Customer:</strong> {scenario.household.customerName}
                </div>
                <div>
                  <strong>Expected Bill:</strong> $
                  {scenario.forecast.expectedBill}
                </div>
                <div>
                  <strong>Expected Range:</strong> $
                  {scenario.forecast.expectedRange.low}–$
                  {scenario.forecast.expectedRange.high}
                </div>
                <div>
                  <strong>Days Remaining:</strong>{' '}
                  {scenario.forecast.daysRemaining}
                </div>
                <div>
                  <strong>Data Quality:</strong>{' '}
                  {scenario.forecast.dataQualityTier}
                </div>
                <div>
                  <strong>Safety Status:</strong>{' '}
                  {scenario.safetyDecision.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
