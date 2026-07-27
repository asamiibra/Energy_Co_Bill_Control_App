'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertCircle, Info, TrendingUp } from 'lucide-react';

import { formatCurrencyRange } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { evaluateForecastUsefulness } from '@/services/policy-service';
import { ForecastRangeVisualization } from '../forecast-range-visualization';
import { ActionConfirmationModal } from '../action-confirmation-modal';
import { EVENT_NAMES } from '@/domain/event';
import { useLocalActionFeedback } from '@/hooks/use-local-action-feedback';
import { auditLedger } from '@/services/audit-ledger';

import type { DemoScenario } from '@/domain/scenario';

interface LimitedDataModeViewProps {
  scenario: DemoScenario;
}

export function LimitedDataModeView({ scenario }: LimitedDataModeViewProps) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const { actionStatus, recordLocalAction } = useLocalActionFeedback(scenario);

  const usefulnessEval = evaluateForecastUsefulness(scenario);
  const availableRecommendations = scenario.recommendations.filter(
    (r) => r.status === 'available'
  );

  return (
    <div className="space-y-6">
      {/* Limited-Data Banner */}
      <div className="status-limited-data rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle
            size={20}
            className="mt-0.5 flex-shrink-0 text-yellow-600"
          />
          <div>
            <h2 className="mb-1 font-semibold text-yellow-900">
              Limited-Data Estimate
            </h2>
            <p className="text-sm text-yellow-800">
              Recent interval-meter data is unavailable. Bill Control is using
              prior billing history, current weather and your tariff, so the
              expected range is wider and recommendations are less personalized.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Forecast Card */}
      <div className="card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Forecast Summary */}
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Your expected bill
            </h2>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm text-gray-600">
                  Estimated charges to date
                </div>
                {scenario.forecast.estimatedChargesToDateRange && (
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrencyRange(
                      scenario.forecast.estimatedChargesToDateRange.low,
                      scenario.forecast.estimatedChargesToDateRange.high
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-600">
                  Expected range (wider due to limited data)
                </div>
                <ForecastRangeVisualization
                  expectedBill={scenario.forecast.expectedBill}
                  range={scenario.forecast.expectedRange}
                />
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>
                    Billing ends{' '}
                    {formatDate(scenario.forecast.billingPeriodEnd, {
                      format: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{scenario.forecast.daysRemaining} days remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Data Quality Information */}
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-yellow-900">
                  Limited data quality
                </span>
              </div>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>
                  <strong>Source:</strong>{' '}
                  {scenario.forecast.sourceCadence === 'monthly-read'
                    ? 'Monthly meter readings'
                    : 'Limited data'}
                </p>
                <p>
                  <strong>Last reading:</strong> Most recent monthly meter read
                </p>
                <p className="mt-2 border-t border-yellow-200 pt-2">
                  Interval meter data provides more precision. The wider range
                  reflects current data availability.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div>Forecast version: {scenario.forecast.forecastVersionId}</div>
              <div>Updated Sep 18 at 8:00 AM</div>
              <div>Data quality tier: {scenario.forecast.dataQualityTier}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why the Range is Wider */}
      <div className="card p-6">
        <div className="mb-4 flex items-start space-x-3">
          <Info size={20} className="mt-0.5 text-blue-600" />
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Why the range is wider
            </h3>
            <p className="text-sm text-gray-600">
              Without recent interval-meter data, Bill Control cannot observe
              current daily or hourly usage patterns. The forecast therefore
              relies more heavily on this household’s prior comparable billing
              periods, weather and tariff information. This creates a wider
              expected range to reflect the increased uncertainty.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Data sources used:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span>Billing history from previous September cycles</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span>Local weather patterns and forecasts</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span>Standard Flex tariff structure</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Drivers Section */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          What&apos;s influencing your estimate
        </h3>

        <div className="space-y-3">
          {scenario.drivers.map((driver) => (
            <div key={driver.id} className="rounded-lg border border-gray-200">
              <button
                onClick={() => {
                  auditLedger.recordEvent(
                    EVENT_NAMES.DRIVER_EXPLANATION_OPENED,
                    {
                      scenarioId: scenario.scenarioId,
                      householdId: scenario.household.customerId,
                      forecastVersionId: scenario.forecast.forecastVersionId,
                      properties: { driverId: driver.id },
                    }
                  );
                  setExpandedDriver(
                    expandedDriver === driver.id ? null : driver.id
                  );
                }}
                data-interaction-id={`limited-driver-${driver.id}`}
                className="focus-visible w-full p-4 text-left transition-colors hover:bg-gray-50"
                aria-expanded={expandedDriver === driver.id}
                aria-controls={`limited-driver-panel-${driver.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <TrendingUp size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {driver.title}
                      </div>
                      {driver.contributionRange && (
                        <div className="text-sm text-gray-600">
                          {formatCurrencyRange(
                            driver.contributionRange.low,
                            driver.contributionRange.high
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedDriver === driver.id ? '−' : '+'}
                  </div>
                </div>
              </button>

              {expandedDriver === driver.id && (
                <div
                  id={`limited-driver-panel-${driver.id}`}
                  className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm text-gray-600"
                >
                  {driver.explanation}
                  <div className="mt-2 text-xs text-gray-500">
                    Source: {driver.source}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {usefulnessEval.allowRecommendations &&
        availableRecommendations.length > 0 && (
          <div className="card p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              What you can do
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Because recent usage detail is unavailable, Bill Control is
              showing a general low-risk option rather than a personalized
              recommendation.
            </p>

            {availableRecommendations.map((recommendation) => (
              <div
                key={recommendation.recommendationId}
                className="rounded-lg border border-blue-200 bg-blue-50 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {recommendation.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {recommendation.description}
                    </p>
                  </div>
                  <span className="ml-2 whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                    {recommendation.effort} effort
                  </span>
                </div>

                {recommendation.benefit && (
                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-gray-900">
                      <strong>Directional estimated bill reduction:</strong>{' '}
                      {formatCurrencyRange(
                        recommendation.benefit.low,
                        recommendation.benefit.high
                      )}
                    </div>

                    <div className="text-xs text-gray-600">
                      <strong>Assumptions:</strong>
                      <ul className="ml-4 mt-1 list-disc space-y-1">
                        {recommendation.benefit.assumptions.map(
                          (assumption, i) => (
                            <li key={i}>{assumption}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-700">
                      This estimate is directional because recent interval usage
                      is unavailable. Actual impact is not guaranteed.
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowActionModal(true)}
                    data-interaction-id="limited-save-action"
                    className="btn-primary"
                  >
                    Save this action
                  </button>
                  <button
                    onClick={() =>
                      recordLocalAction(
                        EVENT_NAMES.REMINDER_SET,
                        'Reminder saved in this browser only. No account change was made.',
                        { reminder: true }
                      )
                    }
                    data-interaction-id="limited-set-reminder"
                    className="btn-secondary"
                  >
                    Set reminder
                  </button>
                  <button
                    onClick={() =>
                      recordLocalAction(
                        EVENT_NAMES.ACTION_PLAN_DECLINED,
                        'No action was saved or executed.'
                      )
                    }
                    data-interaction-id="limited-decline"
                    className="btn-outline"
                  >
                    Not now
                  </button>
                  <button
                    onClick={() =>
                      recordLocalAction(
                        EVENT_NAMES.ADVISOR_REQUESTED,
                        'Advisor interest recorded locally. No message or request was sent.'
                      )
                    }
                    data-interaction-id="limited-advisor-support"
                    className="focus-visible px-4 py-2 text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Talk with an advisor
                  </button>
                </div>
                {actionStatus && (
                  <p className="mt-3 text-sm text-blue-800" role="status">
                    {actionStatus}
                  </p>
                )}
              </div>
            ))}

            {/* Read-only Statement */}
            <div className="mt-4 rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Bill Control will not change your account, tariff, or devices.
                You can save this plan or ask an advisor for help.
              </p>
            </div>
          </div>
        )}

      {/* Support Path (if not actionable) */}
      {!usefulnessEval.allowRecommendations && (
        <div className="card p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Need more precise guidance?
          </h3>
          <p className="mb-4 text-gray-600">
            The current data quality doesn&apos;t support specific
            recommendations, but we&apos;re here to help.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() =>
                recordLocalAction(
                  EVENT_NAMES.ADVISOR_REQUESTED,
                  'Advisor interest recorded locally. No message or request was sent.'
                )
              }
              data-interaction-id="limited-suppressed-advisor"
              className="focus-visible flex items-center space-x-3 rounded-lg border border-blue-200 p-4 text-left transition-colors hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Info size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Talk with an advisor
                </div>
                <div className="text-sm text-gray-600">
                  Get personalized guidance
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                recordLocalAction(
                  EVENT_NAMES.SUPPORT_OPTION_SELECTED,
                  'Interval-data evaluation interest recorded locally. No request was sent.',
                  { properties: { option: 'interval_data_evaluation' } }
                )
              }
              data-interaction-id="limited-interval-evaluation"
              className="focus-visible flex items-center space-x-3 rounded-lg border border-blue-200 p-4 text-left transition-colors hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Request interval-data evaluation
                </div>
                <div className="text-sm text-gray-600">
                  Improve forecast precision
                </div>
              </div>
            </button>
          </div>
          {actionStatus && (
            <p className="mt-3 text-sm text-blue-800" role="status">
              {actionStatus}
            </p>
          )}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && availableRecommendations[0] && (
        <ActionConfirmationModal
          recommendation={availableRecommendations[0]}
          scenario={scenario}
          onClose={() => setShowActionModal(false)}
        />
      )}
    </div>
  );
}
