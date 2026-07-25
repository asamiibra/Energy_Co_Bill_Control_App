'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Thermometer, Clock, Zap } from 'lucide-react';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { buildEvidenceLedger } from '@/services/explanation-evidence-ledger';
import { generateBaselineExplanation } from '@/services/explanation-presenter';
import { ActionConfirmationModal } from '../action-confirmation-modal';
import { ForecastRangeVisualization } from '../forecast-range-visualization';

import type { DemoScenario } from '@/domain/scenario';

interface BaselineForecastViewProps {
  scenario: DemoScenario;
}

export function BaselineForecastView({ scenario }: BaselineForecastViewProps) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  const ledger = buildEvidenceLedger(scenario);
  const explanation = generateBaselineExplanation(ledger);
  const recommendation = scenario.recommendations.find(
    (r) => r.status === 'available'
  );

  return (
    <div className="space-y-6">
      {/* Primary Forecast Card */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Forecast Summary */}
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {explanation.forecastSummary}
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
                  {explanation.rangeSummary}
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
            <div className="rounded-lg bg-green-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-800">
                  Full data quality
                </span>
              </div>
              <p className="text-sm text-green-700">
                Recent interval meter data available with complete tariff
                context.
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <div>Forecast version: {scenario.forecast.forecastVersionId}</div>
              <div>Last updated: Today at 8:00 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          What&apos;s driving your estimate
        </h3>

        <p className="mb-4 text-gray-600">{explanation.driversSummary}</p>

        <div className="space-y-3">
          {scenario.drivers.map((driver, index) => (
            <div key={driver.id} className="rounded-lg border border-gray-200">
              <button
                onClick={() =>
                  setExpandedDriver(
                    expandedDriver === driver.id ? null : driver.id
                  )
                }
                className="w-full p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      {index === 0 && (
                        <Thermometer size={16} className="text-orange-600" />
                      )}
                      {index === 1 && (
                        <TrendingUp size={16} className="text-orange-600" />
                      )}
                      {index === 2 && (
                        <Zap size={16} className="text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {driver.title}
                      </div>
                      {driver.contributionRange && (
                        <div className="text-sm text-orange-600">
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
                <div className="px-4 pb-4 text-sm text-gray-600">
                  {explanation.driverDetails[index]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Section */}
      {recommendation && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            What you can do
          </h3>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {recommendation.title}
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
                  <strong>Assumptions:</strong>
                  <ul className="ml-4 mt-1 list-disc space-y-1">
                    {recommendation.benefit.assumptions.map((assumption, i) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setShowActionModal(true)}
                className="focus-visible rounded-md bg-navy px-4 py-2 text-white transition-colors hover:bg-navy-600"
              >
                Save this action
              </button>
              <button className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800">
                Set reminder
              </button>
              <button className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800">
                Not now
              </button>
              <button className="px-4 py-2 text-blue-600 transition-colors hover:text-blue-800">
                Talk with an advisor
              </button>
            </div>
          </div>

          {/* Read-only Statement */}
          <div className="mt-4 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              Bill Control will not change your thermostat, tariff, or account.
              You can save this plan or ask an advisor for help.
            </p>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && recommendation && (
        <ActionConfirmationModal
          recommendation={recommendation}
          scenario={scenario}
          onClose={() => setShowActionModal(false)}
        />
      )}
    </div>
  );
}
