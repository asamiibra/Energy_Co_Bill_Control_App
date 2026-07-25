'use client';

import { useState } from 'react';
import {
  AlertCircle,
  TrendingUp,
  Info,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { ForecastRangeVisualization } from '../forecast-range-visualization';
import { EVENT_NAMES } from '@/domain/event';
import { useLocalActionFeedback } from '@/hooks/use-local-action-feedback';
import { auditLedger } from '@/services/audit-ledger';

import type { DemoScenario } from '@/domain/scenario';

interface ForecastMissViewProps {
  scenario: DemoScenario;
}

export function ForecastMissView({ scenario }: ForecastMissViewProps) {
  const [showWhyChanged, setShowWhyChanged] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const { actionStatus, recordLocalAction } = useLocalActionFeedback(scenario);

  const missEval = scenario.forecast.forecastMissEvaluation;
  const previousForecast = scenario.previousForecast;
  const finalBill = scenario.forecast.finalBill;

  if (!missEval || !previousForecast || !finalBill) {
    return <div>Forecast miss data unavailable</div>;
  }

  return (
    <div className="space-y-6">
      {/* Miss Acknowledgment Banner */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-lg font-semibold text-orange-900">
              Your final bill was outside the range we previously showed
            </h2>
            <p className="mb-2 text-orange-800">
              We are updating how this household&apos;s seasonal usage is
              represented. No action is required, and you can review the details
              or speak with an advisor.
            </p>
            <div className="flex items-center space-x-2 text-sm text-orange-700">
              <Info size={16} />
              <span>
                This is normal and helps improve future forecasts. You remain
                protected by Energy Co&apos;s standard billing protections.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast vs. Final Bill Comparison */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Forecast comparison
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Last Communicated Forecast */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-500">
              Last Communicated Forecast
            </div>
            <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 text-2xl font-bold text-gray-900">
                {formatCurrency(previousForecast.expectedBill, {
                  includeDecimals: false,
                })}
              </div>
              <div className="mb-3 text-sm text-gray-600">
                Range:{' '}
                {formatCurrencyRange(
                  previousForecast.expectedRange.low,
                  previousForecast.expectedRange.high
                )}
              </div>
              <ForecastRangeVisualization
                expectedBill={previousForecast.expectedBill}
                range={previousForecast.expectedRange}
                className="origin-left scale-90"
              />
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div>
                  Generated: {formatDateTime(previousForecast.generatedAt)}
                </div>
                <div>Version: {previousForecast.forecastVersionId}</div>
                <div>
                  Communicated:{' '}
                  {Math.floor((missEval.hoursBeforeClose || 0) / 24)} days
                  before billing close
                </div>
              </div>
            </div>
          </div>

          {/* Final Bill */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Final Bill</div>
            <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(finalBill, { includeDecimals: false })}
                </div>
                <span className="text-sm font-medium text-orange-600">
                  +${missEval.missAmountBeyondRange}
                </span>
              </div>
              <div className="mb-3 text-sm text-orange-800">
                Exceeded high estimate by ${missEval.missAmountBeyondRange}
              </div>

              <div className="space-y-2 rounded bg-white p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous high estimate:</span>
                  <span className="font-medium">
                    ${previousForecast.expectedRange.high}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual final bill:</span>
                  <span className="font-medium">${finalBill}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Miss amount:</span>
                  <span className="font-semibold text-orange-600">
                    +${missEval.missAmountBeyondRange}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <div>
                  Billing closed:{' '}
                  {formatDateTime(missEval.billingCloseAt || '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Miss Evaluation Details */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-2">
            <Info size={16} className="mt-0.5 flex-shrink-0 text-gray-600" />
            <div className="text-sm text-gray-700">
              <strong>Evaluation criteria met:</strong>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li>
                  Range communicated{' '}
                  {Math.floor((missEval.hoursBeforeClose || 0) / 24)} days
                  before billing close (≥24 hours required)
                </li>
                <li>
                  Final bill (${finalBill}) exceeded high estimate ($
                  {previousForecast.expectedRange.high})
                </li>
                <li>Miss direction: {missEval.missDirection}</li>
                <li>This is a valid forecast-surprise evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* What Changed */}
      <div className="card p-6">
        <button
          onClick={() => {
            setShowWhyChanged(!showWhyChanged);
            auditLedger.recordEvent(EVENT_NAMES.WHY_CHANGED_OPENED, {
              scenarioId: scenario.scenarioId,
              householdId: scenario.household.customerId,
              forecastVersionId: previousForecast.forecastVersionId,
            });
          }}
          data-interaction-id="forecast-miss-review-change"
          className="focus-visible flex w-full items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            What changed after the last forecast
          </h3>
          <div className="text-gray-400">{showWhyChanged ? '−' : '+'}</div>
        </button>

        {showWhyChanged && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              The following factors contributed to the final bill exceeding our
              forecast range:
            </p>

            {scenario.drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-start space-x-3 rounded-md border border-orange-100 bg-orange-50 p-3"
              >
                <TrendingUp
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-orange-600"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {driver.title}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-700">
                    {driver.explanation}
                  </div>
                  {driver.contributionRange && (
                    <div className="mt-1 text-sm text-orange-600">
                      Contributed:{' '}
                      {formatCurrencyRange(
                        driver.contributionRange.low,
                        driver.contributionRange.high
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> These factors occurred or became
                clear after the last forecast update on{' '}
                {formatDateTime(previousForecast.generatedAt)}. Bill Control
                updates forecasts regularly, but unexpected changes can occur
                between updates.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* How Bill Control Will Improve */}
      <div className="card p-6">
        <button
          onClick={() => setShowImprovements(!showImprovements)}
          data-interaction-id="forecast-miss-corrective-response"
          className="focus-visible flex w-full items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            How Bill Control will improve
          </h3>
          <div className="text-gray-400">{showImprovements ? '−' : '+'}</div>
        </button>

        {showImprovements && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              We&apos;re using this learning to improve future forecasts for
              your household:
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-green-600"
                />
                <div>
                  <div className="font-medium text-green-900">
                    Range calibration review
                  </div>
                  <div className="mt-1 text-sm text-green-800">
                    Your household&apos;s seasonal usage patterns will be
                    updated to better reflect late-summer heat events.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-green-600"
                />
                <div>
                  <div className="font-medium text-green-900">
                    Weather sensitivity adjustment
                  </div>
                  <div className="mt-1 text-sm text-green-800">
                    The model will place more weight on late-forecast weather
                    changes for heat-pump-equipped homes.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-green-600"
                />
                <div>
                  <div className="font-medium text-green-900">
                    Future range widening
                  </div>
                  <div className="mt-1 text-sm text-green-800">
                    Similar periods may use a slightly wider range to better
                    reflect uncertainty during variable weather.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                These improvements will be applied starting with your next
                billing cycle. Your historical billing data remains accurate and
                unchanged.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Support and Actions */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Next steps</h3>

        <div className="space-y-3">
          <button
            onClick={() =>
              recordLocalAction(
                EVENT_NAMES.ADVISOR_REQUESTED,
                'Advisor interest recorded locally. No message or request was sent.'
              )
            }
            data-interaction-id="forecast-miss-advisor"
            className="focus-visible flex w-full items-center space-x-3 rounded-lg border border-blue-200 p-4 text-left transition-colors hover:bg-blue-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Talk with an advisor
              </div>
              <div className="text-sm text-gray-600">
                Discuss how range improvements will affect future estimates
              </div>
            </div>
          </button>

          {!acknowledged && (
            <button
              onClick={() => {
                setAcknowledged(true);
                recordLocalAction(
                  EVENT_NAMES.FORECAST_MISS_ACKNOWLEDGED,
                  'Acknowledgment recorded locally. No account or billing change was made.'
                );
              }}
              data-interaction-id="forecast-miss-acknowledge"
              className="btn-primary w-full"
            >
              Acknowledge and continue
            </button>
          )}

          {acknowledged && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle size={20} className="flex-shrink-0" />
                <span className="font-medium">
                  Thank you. Your next forecast will reflect these improvements.
                </span>
              </div>
            </div>
          )}
          {actionStatus && !acknowledged && (
            <p className="text-sm text-blue-800" role="status">
              {actionStatus}
            </p>
          )}
        </div>
      </div>

      {/* Transparency Note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong>Our commitment:</strong> Bill Control acknowledges when
          forecasts miss rather than hiding or silently overwriting them. Every
          miss helps improve future accuracy. You remain protected by Energy
          Co&apos;s standard billing practices and dispute resolution processes.
        </p>
      </div>
    </div>
  );
}
