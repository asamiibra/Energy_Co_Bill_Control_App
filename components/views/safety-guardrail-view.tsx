'use client';

import {
  Shield,
  HelpCircle,
  Phone,
  FileText,
  Users,
  DollarSign,
} from 'lucide-react';

import { buildEvidenceLedger } from '@/services/explanation-evidence-ledger';
import { generateSafetyExplanation } from '@/services/explanation-presenter';
import { ForecastRangeVisualization } from '../forecast-range-visualization';

import type { DemoScenario } from '@/domain/scenario';

interface SafetyGuardrailViewProps {
  scenario: DemoScenario;
}

export function SafetyGuardrailView({ scenario }: SafetyGuardrailViewProps) {
  const ledger = buildEvidenceLedger(scenario);
  const explanation = generateSafetyExplanation(ledger);
  const suppressedRecommendations = scenario.recommendations.filter(
    (r) => r.status === 'suppressed'
  );
  const availableRecommendations = scenario.recommendations.filter(
    (r) => r.status === 'available'
  );

  return (
    <div className="space-y-6">
      {/* Safety Message */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield size={24} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-blue-900">
              Essential Use Protection Active
            </h2>
            <p className="mb-3 text-blue-800">{explanation.safetySummary}</p>
            <div className="text-sm text-blue-700">
              <p>
                Customer safety and comfort come first. Savings recommendations
                have been limited.
              </p>
              <p className="mt-1">No automatic action has been taken.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Forecast */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Your current forecast
        </h3>

        <p className="mb-4 text-gray-600">{explanation.forecastSummary}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Forecast Details */}
          <div>
            <ForecastRangeVisualization
              expectedBill={scenario.forecast.expectedBill}
              range={scenario.forecast.expectedRange}
            />
          </div>

          {/* Forecast Context */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <div>
                <strong>Season:</strong> Winter billing period
              </div>
              <div>
                <strong>Days remaining:</strong>{' '}
                {scenario.forecast.daysRemaining}
              </div>
              <div>
                <strong>Data quality:</strong>{' '}
                {scenario.forecast.dataQualityTier}
              </div>
              <div>
                <strong>Protection:</strong> Essential use (customer-declared)
              </div>
            </div>
          </div>
        </div>

        {/* Drivers */}
        <div className="mt-6">
          <h4 className="mb-3 font-medium text-gray-900">
            {explanation.driversSummary}
          </h4>
          <div className="space-y-2">
            {explanation.driverDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-md bg-gray-50 p-3"
              >
                <div className="mt-2 h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-700">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suppressed Recommendations */}
      {suppressedRecommendations.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recommendations limited for your protection
          </h3>

          {suppressedRecommendations.map((recommendation) => (
            <div
              key={recommendation.recommendationId}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start space-x-3">
                <Shield size={20} className="mt-0.5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-700 line-through">
                    {recommendation.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    This recommendation has been suppressed due to essential-use
                    protection.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    Policy Decision: {recommendation.policyDecisionId}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Options */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Support options available
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Check budget-plan eligibility
              </div>
              <div className="text-sm text-gray-600">
                Spread costs evenly throughout the year
              </div>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Review a support tariff
              </div>
              <div className="text-sm text-gray-600">
                Special rates for qualifying customers
              </div>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Review available support options
              </div>
              <div className="text-sm text-gray-600">
                Energy assistance and hardship programs
              </div>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <HelpCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                View safe alternatives
              </div>
              <div className="text-sm text-gray-600">
                Low-impact energy-saving tips
              </div>
            </div>
          </button>
        </div>

        {/* Primary Support CTA */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Need to talk with someone?
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Our advisors can help you explore options that work for your
                situation.
              </p>
            </div>
            <button className="focus-visible flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              <Phone size={16} />
              <span>Speak with an advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Available Safe Actions */}
      {availableRecommendations.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Safe actions available
          </h3>

          {availableRecommendations.map((recommendation) => (
            <div
              key={recommendation.recommendationId}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
            >
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {recommendation.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {recommendation.description}
                  </p>

                  <button className="mt-3 rounded-md border border-blue-300 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50">
                    {recommendation.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policy Information */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          <p>
            <strong>Essential-use protection policy:</strong> This decision
            follows the essential-use protection selected for this account. You
            maintain full control over your energy usage and can adjust these
            preferences at any time.
          </p>
          <p className="mt-2">
            <strong>Policy ID:</strong>{' '}
            {scenario.safetyDecision.policyDecisionId}
          </p>
        </div>
      </div>
    </div>
  );
}
