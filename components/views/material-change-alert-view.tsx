'use client';

import { useState } from 'react';
import { AlertTriangle, Calendar, TrendingUp, Info } from 'lucide-react';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { buildEvidenceLedger } from '@/services/explanation-evidence-ledger';
import { generateAlertExplanation } from '@/services/explanation-presenter';
import { evaluateMaterialChange } from '@/lib/material-change-evaluator';
import { ForecastRangeVisualization } from '../forecast-range-visualization';
import { actionIntentService } from '@/services/action-intent-service';
import { auditLedger } from '@/services/audit-ledger';
import { EVENT_NAMES } from '@/domain/event';

import type { DemoScenario } from '@/domain/scenario';

interface MaterialChangeAlertViewProps {
  scenario: DemoScenario;
}

export function MaterialChangeAlertView({
  scenario,
}: MaterialChangeAlertViewProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<
    string[]
  >([]);
  const [showWhyChanged, setShowWhyChanged] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const ledger = buildEvidenceLedger(scenario);
  const explanation = generateAlertExplanation(ledger);
  const availableRecommendations = scenario.recommendations.filter(
    (r) => r.status === 'available'
  );

  // Calculate material change details
  let materialChangeEval;
  if (scenario.previousForecast) {
    materialChangeEval = evaluateMaterialChange(
      scenario.previousForecast,
      scenario.forecast
    );
  }

  const toggleRecommendation = (recId: string) => {
    auditLedger.recordEvent(EVENT_NAMES.RECOMMENDATION_SELECTED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
      recommendationId: recId,
    });
    setSelectedRecommendations((prev) =>
      prev.includes(recId)
        ? prev.filter((id) => id !== recId)
        : [...prev, recId]
    );
  };

  const recordActionEvent = (
    eventName: string,
    properties: Record<string, unknown> = {}
  ) => {
    auditLedger.recordEvent(eventName, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
      policyDecisionId: scenario.safetyDecision.policyDecisionId,
      properties,
    });
  };

  const handleSave = () => {
    const selected = availableRecommendations.filter((recommendation) =>
      selectedRecommendations.includes(recommendation.recommendationId)
    );
    const plan = actionIntentService.saveActionPlan(
      scenario.scenarioId,
      scenario.household.customerId,
      selected
    );
    recordActionEvent(EVENT_NAMES.ACTION_PLAN_SAVED, {
      planId: plan.planId,
      recommendationIds: plan.recommendationIds,
    });
    setActionStatus(
      'Selected actions saved as local intent. No external action occurred.'
    );
  };

  const handleModify = () => {
    recordActionEvent(EVENT_NAMES.ACTION_PLAN_MODIFIED, {
      selectedRecommendations,
    });
    setActionStatus('Selection is ready to modify locally.');
  };

  const handleDecline = () => {
    setSelectedRecommendations([]);
    recordActionEvent(EVENT_NAMES.ACTION_PLAN_DECLINED);
    setActionStatus('Actions declined. No changes were made.');
  };

  const handleAdvisor = () => {
    recordActionEvent(EVENT_NAMES.ADVISOR_REQUESTED);
    setActionStatus(
      'Advisor support intent recorded locally. No real case was created.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="rounded-r-lg border-l-4 border-orange-400 bg-orange-50 p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle size={20} className="text-orange-500" />
          <div>
            <h2 className="font-medium text-orange-800">
              Bill Estimate Updated
            </h2>
            <p className="mt-1 text-orange-700">
              You are trending {scenario.cohortContext.usageVariancePercent}%
              above your usual monthly usage.
            </p>
          </div>
        </div>
      </div>

      {/* Forecast Comparison */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Your estimate changed
        </h3>

        <p className="mb-4 text-gray-600">{explanation.revisionSummary}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Previous Forecast */}
          {scenario.previousForecast && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-500">
                Previous Estimate
              </div>
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(scenario.previousForecast.expectedBill, {
                    includeDecimals: false,
                  })}
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  Range:{' '}
                  {formatCurrencyRange(
                    scenario.previousForecast.expectedRange.low,
                    scenario.previousForecast.expectedRange.high
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Generated:{' '}
                  {formatDateTime(scenario.previousForecast.generatedAt)}
                </div>
                <div className="text-xs text-gray-500">
                  Version: {scenario.previousForecast.forecastVersionId}
                </div>
              </div>
            </div>
          )}

          {/* Current Forecast */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              Updated Estimate
            </div>
            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <div className="mb-2 text-2xl font-bold text-gray-900">
                {formatCurrency(scenario.forecast.expectedBill, {
                  includeDecimals: false,
                })}
              </div>
              <ForecastRangeVisualization
                expectedBill={scenario.forecast.expectedBill}
                range={scenario.forecast.expectedRange}
              />
              <div className="mt-2 text-xs text-gray-600">
                Generated: {formatDateTime(scenario.forecast.generatedAt)}
              </div>
              <div className="text-xs text-gray-600">
                Version: {scenario.forecast.forecastVersionId}
              </div>
            </div>
          </div>
        </div>

        {materialChangeEval?.isAlert && (
          <p className="mt-4 text-sm text-gray-600">
            This update is important because the estimate and expected range
            changed meaningfully as new information arrived.
          </p>
        )}
      </div>

      {/* Why This Changed */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <button
          onClick={() => {
            setShowWhyChanged(!showWhyChanged);
            recordActionEvent(EVENT_NAMES.WHY_CHANGED_OPENED);
          }}
          data-interaction-id="alert-why-changed"
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Why this changed
          </h3>
          <div className="text-gray-400">{showWhyChanged ? '−' : '+'}</div>
        </button>

        {showWhyChanged && (
          <div className="mt-4 space-y-3">
            <p className="text-gray-600">{explanation.driversSummary}</p>

            {explanation.driverDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-md bg-gray-50 p-3"
              >
                <TrendingUp size={16} className="mt-0.5 text-orange-500" />
                <span className="text-sm text-gray-700">{detail}</span>
              </div>
            ))}

            {explanation.dataQualityNote && (
              <div className="flex items-start space-x-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <Info size={16} className="mt-0.5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {explanation.dataQualityNote}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Available Actions */}
      {availableRecommendations.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Actions you can take
          </h3>

          <div className="space-y-4">
            {availableRecommendations.map((recommendation, index) => (
              <div
                key={recommendation.recommendationId}
                className={`rounded-lg border p-4 transition-colors ${
                  selectedRecommendations.includes(
                    recommendation.recommendationId
                  )
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    aria-label={`Select ${recommendation.title}`}
                    type="checkbox"
                    data-interaction-id={`alert-select-${recommendation.recommendationId}`}
                    checked={selectedRecommendations.includes(
                      recommendation.recommendationId
                    )}
                    onChange={() =>
                      toggleRecommendation(recommendation.recommendationId)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. {recommendation.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {recommendation.description}
                        </p>
                      </div>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                        {recommendation.effort} effort
                      </span>
                    </div>

                    {recommendation.benefit && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-900">
                          <strong>Estimated benefit:</strong>{' '}
                          {formatCurrencyRange(
                            recommendation.benefit.low,
                            recommendation.benefit.high
                          )}
                        </div>

                        <div className="text-xs text-gray-600">
                          <strong>Assumptions:</strong>{' '}
                          {recommendation.benefit.assumptions.join('; ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <p id="alert-selection-help" className="mt-4 text-sm text-gray-600">
            Select at least one action to enable saving.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              data-interaction-id="alert-save-selected"
              disabled={selectedRecommendations.length === 0}
              aria-describedby="alert-selection-help"
              className={`focus-visible rounded-md px-4 py-2 transition-colors ${
                selectedRecommendations.length === 0
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-navy text-white hover:bg-navy-600'
              }`}
            >
              Save selected actions
            </button>
            <button
              onClick={handleModify}
              data-interaction-id="alert-modify"
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              Modify
            </button>
            <button
              onClick={handleDecline}
              data-interaction-id="alert-decline"
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              Not now
            </button>
            <button
              onClick={handleAdvisor}
              data-interaction-id="alert-advisor-support"
              className="px-4 py-2 text-blue-600 transition-colors hover:text-blue-800"
            >
              Talk with an advisor
            </button>
          </div>

          {actionStatus && (
            <p className="mt-3 text-sm text-blue-800" role="status">
              {actionStatus}
            </p>
          )}

          {/* Read-only Statement */}
          <div className="mt-4 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              Bill Control will not change your thermostat, tariff, or account.
              You can save this plan or ask an advisor for help.
            </p>
          </div>
        </div>
      )}

      {/* Days Remaining */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {scenario.forecast.daysRemaining} days remaining in billing period
          </span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          You still have time to influence your final bill through energy-saving
          actions.
        </p>
      </div>
    </div>
  );
}
