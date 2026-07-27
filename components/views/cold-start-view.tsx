'use client';

import { useState } from 'react';
import {
  Home,
  Users,
  Thermometer,
  Zap,
  Calendar,
  Clock,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { ForecastRangeVisualization } from '../forecast-range-visualization';
import { coldStartRefinedScenario } from '@/data/scenarios/cold-start';
import { auditLedger } from '@/services/audit-ledger';
import { EVENT_NAMES } from '@/domain/event';
import { useLocalActionFeedback } from '@/hooks/use-local-action-feedback';

import type { DemoScenario } from '@/domain/scenario';

interface ColdStartViewProps {
  scenario: DemoScenario;
}

export function ColdStartView({
  scenario: initialScenario,
}: ColdStartViewProps) {
  const [scenario, setScenario] = useState(initialScenario);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const recommendation = scenario.recommendations.find(
    (candidate) => candidate.status === 'available'
  );
  const [isRefined, setIsRefined] = useState(false);
  const { actionStatus, recordLocalAction } = useLocalActionFeedback(scenario);

  const handleRefineEstimate = () => {
    // Simulate refinement by switching to refined scenario
    setScenario(coldStartRefinedScenario);
    setIsRefined(true);
    setShowQuestionnaire(false);

    // Record events
    auditLedger.recordEvent('cold_start_estimate_refined', {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      properties: {
        refinedFromInitial: true,
        householdSize: 3,
        heatingType: 'heat-pump',
        hasEV: true,
        hasSmartThermostat: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Home size={24} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-blue-900">
              Welcome to Bill Control
            </h2>
            <p className="mb-2 text-sm text-blue-800">
              We don&apos;t yet have enough history for this home. This early
              estimate uses similar homes, local weather, and the current
              tariff.
            </p>
            <p className="text-sm font-medium text-blue-700">
              The range may narrow as Energy Co observes more of this
              household’s usage history.
            </p>
          </div>
        </div>
      </div>

      {/* Refinement Comparison (if refined) */}
      {isRefined &&
        initialScenario.forecast.expectedBill !==
          scenario.forecast.expectedBill && (
          <div
            className="rounded-lg border border-green-200 bg-green-50 p-4"
            role="status"
            aria-live="polite"
          >
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-semibold text-green-900">
                Estimate Refined
              </span>
            </div>
            <p className="mb-3 text-sm text-green-800">
              Estimate refined in this prototype using sample answers. No
              account profile or consent setting was changed.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-700">Initial Range</div>
                <div className="text-green-900">
                  {formatCurrencyRange(
                    initialScenario.forecast.expectedRange.low,
                    initialScenario.forecast.expectedRange.high
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-green-700">Refined Range</div>
                <div className="font-semibold text-green-900">
                  {formatCurrencyRange(
                    scenario.forecast.expectedRange.low,
                    scenario.forecast.expectedRange.high
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-green-900">
              <div className="font-medium">
                Sample attributes that changed the comparison group
              </div>
              <ul className="mt-1 list-disc pl-5">
                <li>Household size: 3 people</li>
                <li>Heating type: Heat pump</li>
                <li>Electric vehicle: Yes</li>
                <li>Smart thermostat: Yes</li>
              </ul>
            </div>
          </div>
        )}

      {/* Primary Forecast Card */}
      <div className="card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Forecast Summary */}
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {isRefined
                ? 'Your refined estimate'
                : 'Early estimate based on similar homes'}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm text-gray-600">Bill to date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(scenario.forecast.billToDate)}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-600">
                  {isRefined
                    ? 'Refined expected range'
                    : 'Expected range — wider because household history is limited'}
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

          {/* Right Column - Data Quality */}
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-blue-900">
                  {isRefined
                    ? 'Refined cohort estimate'
                    : 'Cohort-based estimate'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Comparison basis:</strong> Aggregated usage patterns
                  from similar townhomes in the same climate and tariff context.
                </p>
                {isRefined && (
                  <p>
                    <strong>Refined using:</strong> 3-person townhomes with heat
                    pumps, EVs and smart thermostats
                  </p>
                )}
                <p className="mt-2 border-t border-blue-200 pt-2">
                  No individual neighbor’s usage is shown or used as a direct
                  comparison.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div>Forecast version: {scenario.forecast.forecastVersionId}</div>
              <div>Updated Jul 15 at 10:30 AM</div>
              <div>Account age: New customer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Questionnaire Section */}
      {!isRefined && (
        <div className="card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <HelpCircle size={20} className="mt-0.5 text-gray-600" />
              <div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  Help us refine your estimate
                </h3>
                <p className="text-sm text-gray-600">
                  Optional: Sample answers demonstrate how a more specific
                  comparison group may refine the estimate. No question is
                  required.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuestionnaire(!showQuestionnaire)}
              data-interaction-id="cold-start-toggle-details"
              className="focus-visible flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              aria-expanded={showQuestionnaire}
              aria-controls="cold-start-sample-questionnaire"
            >
              <span>{showQuestionnaire ? 'Hide' : 'Add details'}</span>
              <ChevronRight
                size={16}
                className={`transform transition-transform ${showQuestionnaire ? 'rotate-90' : ''}`}
              />
            </button>
          </div>

          {showQuestionnaire && (
            <div
              id="cold-start-sample-questionnaire"
              className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4"
            >
              <p className="mb-4 text-sm text-gray-600">
                In this prototype, sample answers remain in the browser and are
                used only to demonstrate comparison-group refinement. No account
                profile is updated.
              </p>
              <p className="text-sm text-gray-600">
                Skipping these questions does not affect account service or
                eligibility.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3">
                  <Users size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Household size
                    </div>
                    <div className="text-xs text-gray-500">3 people</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3">
                  <Thermometer size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Heating type
                    </div>
                    <div className="text-xs text-gray-500">Heat pump</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3">
                  <Zap size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Electric vehicle
                    </div>
                    <div className="text-xs text-gray-500">Yes</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3">
                  <Home size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Smart thermostat
                    </div>
                    <div className="text-xs text-gray-500">Yes</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleRefineEstimate}
                  data-interaction-id="cold-start-refine"
                  className="btn-primary"
                >
                  Refine estimate with sample answers
                </button>
                <button
                  onClick={() => setShowQuestionnaire(false)}
                  data-interaction-id="cold-start-continue-without"
                  className="btn-outline"
                >
                  Continue without answering
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                <strong>Demo note:</strong> In production, you would answer
                these questions individually. This demo uses pre-filled sample
                answers to show the refinement behavior.
              </p>
            </div>
          )}
        </div>
      )}

      {/* What's driving the estimate */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {isRefined
            ? 'Updated estimate drivers'
            : 'What’s influencing your estimate'}
        </h3>

        <div className="space-y-3">
          {scenario.drivers.map((driver) => (
            <div
              key={driver.id}
              className="flex items-start space-x-3 rounded-md bg-gray-50 p-3"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Home size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{driver.title}</div>
                <div className="mt-0.5 text-sm text-gray-600">
                  {driver.explanation}
                </div>
                {driver.contributionRange && (
                  <div className="mt-1 text-sm text-blue-600">
                    {formatCurrencyRange(
                      driver.contributionRange.low,
                      driver.contributionRange.high
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low-risk recommendation */}
      {recommendation && (
        <div className="card p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Stay informed as Bill Control learns
          </h3>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">
              {recommendation.title}
            </h4>
            <p className="mb-4 text-sm text-gray-600">
              {recommendation.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  recordLocalAction(
                    EVENT_NAMES.REMINDER_SET,
                    'Alert preference saved in this browser only. No account setting changed and no notification will be sent.',
                    { reminder: true }
                  )
                }
                data-interaction-id="cold-start-save-alert"
                className="btn-primary"
              >
                Save prototype alert preference
              </button>
              <button
                onClick={() =>
                  recordLocalAction(
                    EVENT_NAMES.ACTION_PLAN_DECLINED,
                    'No alert preference was saved.'
                  )
                }
                data-interaction-id="cold-start-decline-alert"
                className="btn-secondary"
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
                data-interaction-id="cold-start-advisor"
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

          <div className="mt-4 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              This state is limited to forecast updates and support while
              household history develops.
            </p>
          </div>
        </div>
      )}

      {/* Support */}
      <div className="card border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Questions about your estimate?
        </h3>
        <p className="mb-4 text-sm text-gray-700">
          Our advisors can help you understand your early estimate and what to
          expect as your account builds history.
        </p>
        <button
          onClick={() =>
            recordLocalAction(
              EVENT_NAMES.ADVISOR_REQUESTED,
              'Advisor interest recorded locally. No message or request was sent.'
            )
          }
          data-interaction-id="cold-start-support-advisor"
          className="btn-primary"
        >
          Talk with an advisor
        </button>
      </div>
    </div>
  );
}
