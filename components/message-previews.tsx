'use client';

import { Mail, Smartphone } from 'lucide-react';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';

import type { DemoScenario } from '@/domain/scenario';

interface MessagePreviewsProps {
  scenario: DemoScenario;
  onViewForecast: () => void;
}

export function MessagePreviews({
  scenario,
  onViewForecast,
}: MessagePreviewsProps) {
  const availableRecommendations = scenario.recommendations.filter(
    (recommendation) => recommendation.status === 'available'
  );

  // Generate message content based on scenario type
  const generateSMSContent = () => {
    switch (scenario.scenarioId) {
      case 'baseline_alex_summer':
        return `Energy Co: Your expected bill is ${formatCurrency(scenario.forecast.expectedBill, { includeDecimals: false })}, with an expected range of ${formatCurrencyRange(scenario.forecast.expectedRange.low, scenario.forecast.expectedRange.high)}. You have ${scenario.forecast.daysRemaining} days remaining. See what is driving the estimate and what you can do.`;

      case 'alert_alex_late_summer':
        const prevBill = scenario.previousForecast?.expectedBill;
        const currentBill = scenario.forecast.expectedBill;
        return prevBill === undefined
          ? 'Energy Co: Your bill forecast has been updated.'
          : `Energy Co: Your expected bill has changed from ${formatCurrency(prevBill, { includeDecimals: false })} to ${formatCurrency(currentBill, { includeDecimals: false })}. ${scenario.drivers.map((driver) => driver.title).join(', ')} are the main drivers. You still have time to act.`;

      case 'safety_jordan_winter':
        return `Energy Co: Your winter bill forecast is ${formatCurrency(scenario.forecast.expectedBill, { includeDecimals: false })}. Essential-use protection is active for your account. Support options available.`;

      default:
        return `Energy Co: Your bill forecast has been updated. View your estimate and recommended actions.`;
    }
  };

  const generateEmailSubject = () => {
    switch (scenario.scenarioId) {
      case 'baseline_alex_summer':
        return 'Your energy bill forecast is ready';

      case 'alert_alex_late_summer':
        return 'Your bill estimate changed — here is why';

      case 'safety_jordan_winter':
        return 'Your winter forecast with essential-use protection';

      default:
        return 'Bill Control update available';
    }
  };

  const generateEmailContent = () => {
    const baseContent = {
      greeting: `Hi ${scenario.household.customerName.split(' ')[0]},`,
      footer: `Best regards,\nThe Energy Co Bill Control Team\n\nThis is a demonstration using synthetic data. In production, you can adjust your message preferences in your account settings.`,
    };

    switch (scenario.scenarioId) {
      case 'baseline_alex_summer':
        return {
          ...baseContent,
          body: `Your expected bill for the billing period ending ${formatDate(scenario.forecast.billingPeriodEnd)} is ${formatCurrency(scenario.forecast.expectedBill, { includeDecimals: false })}.

Expected range: ${formatCurrencyRange(scenario.forecast.expectedRange.low, scenario.forecast.expectedRange.high)}
Days remaining: ${scenario.forecast.daysRemaining}
Data quality: Full interval data available

What's driving your estimate:
${scenario.drivers.map((driver) => `• ${driver.explanation}`).join('\n')}

Recommended action:
${availableRecommendations[0]?.title}${availableRecommendations[0]?.benefit ? ` — estimated benefit of ${formatCurrencyRange(availableRecommendations[0].benefit.low, availableRecommendations[0].benefit.high)}` : ''}

Remember: Bill Control will not change your thermostat, tariff, or account. You can save this plan or ask an advisor for help.`,
        };

      case 'alert_alex_late_summer':
        const previousForecast = scenario.previousForecast;
        if (!previousForecast) {
          return {
            ...baseContent,
            body: 'Your bill forecast was updated. Open Bill Control to review the current approved estimate.',
          };
        }
        return {
          ...baseContent,
          body: `Your bill estimate has been updated due to material changes in your usage pattern.

Previous estimate: ${formatCurrency(previousForecast.expectedBill, { includeDecimals: false })} (range: ${formatCurrencyRange(previousForecast.expectedRange.low, previousForecast.expectedRange.high)})
Updated estimate: ${formatCurrency(scenario.forecast.expectedBill, { includeDecimals: false })} (range: ${formatCurrencyRange(scenario.forecast.expectedRange.low, scenario.forecast.expectedRange.high)})

Why this changed:
${scenario.drivers.map((driver) => `• ${driver.explanation}`).join('\n')}

Recommended actions:
${availableRecommendations
  .map(
    (recommendation, index) =>
      `${index + 1}. ${recommendation.title}${recommendation.benefit ? ` — estimated benefit ${formatCurrencyRange(recommendation.benefit.low, recommendation.benefit.high)}` : ''}`
  )
  .join('\n')}

You still have ${scenario.forecast.daysRemaining} days to influence your final bill.`,
        };

      case 'safety_jordan_winter':
        return {
          ...baseContent,
          body: `Your winter forecast shows an expected bill of ${formatCurrency(scenario.forecast.expectedBill, { includeDecimals: false })} with a range of ${formatCurrencyRange(scenario.forecast.expectedRange.low, scenario.forecast.expectedRange.high)}.

Essential-use protection is active on your account, which means:
• We're not recommending reductions in essential heating
• Customer safety and comfort come first
• Support options are prioritized over savings recommendations

Available support:
${scenario.safetyDecision.supportOptions.map((option) => `• ${option}`).join('\n')}

You have ${scenario.forecast.daysRemaining} days remaining in your billing period.`,
        };

      default:
        return {
          ...baseContent,
          body: 'Your bill forecast has been updated. Please review your estimate and any available recommendations.',
        };
    }
  };

  const smsContent = generateSMSContent();
  const emailSubject = generateEmailSubject();
  const emailContent = generateEmailContent();

  return (
    <div className="space-y-6">
      {/* SMS Preview */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Smartphone size={16} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Text Message Preview
            </h3>
            <p className="text-sm text-gray-600">Message-first engagement</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="mx-auto max-w-sm">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy">
                  <span className="text-xs font-bold text-white">EC</span>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  Energy Co
                </span>
                <span className="text-xs text-gray-400">now</span>
              </div>
              <div className="text-sm leading-relaxed text-gray-900">
                {smsContent}
              </div>
              <div className="mt-3">
                <button
                  onClick={onViewForecast}
                  data-interaction-id="message-sms-view-forecast"
                  className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                >
                  View forecast
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          <strong>Demo behavior:</strong> This message preview demonstrates the
          message-first product model. In production, messages would be
          delivered via your preferred channel.
        </p>
      </div>

      {/* Email Preview */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Mail size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Email Preview</h3>
            <p className="text-sm text-gray-600">
              Detailed forecast information
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border bg-white">
            {/* Email Header */}
            <div className="bg-navy p-4 text-white">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white bg-opacity-20">
                  <span className="text-sm font-bold text-white">EC</span>
                </div>
                <div>
                  <div className="font-semibold">Energy Co</div>
                  <div className="text-sm text-blue-100">Bill Control</div>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-6">
              <div className="mb-2 text-sm text-gray-600">
                <strong>Subject:</strong> {emailSubject}
              </div>
              <div className="mb-4 text-sm text-gray-600">
                <strong>To:</strong>{' '}
                {scenario.household.customerName
                  .toLowerCase()
                  .replace(' ', '.')}
                @email.com
              </div>

              <div className="prose prose-sm max-w-none">
                <p>{emailContent.greeting}</p>

                <div className="whitespace-pre-line leading-relaxed text-gray-700">
                  {emailContent.body}
                </div>

                <div className="mt-4 rounded-r border-l-4 border-blue-400 bg-blue-50 p-3">
                  <button
                    onClick={onViewForecast}
                    data-interaction-id="message-email-view-forecast"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    View your complete forecast →
                  </button>
                </div>

                <div className="mt-6 whitespace-pre-line border-t pt-4 text-gray-600">
                  {emailContent.footer}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          <strong>Demo behavior:</strong> This email preview shows how detailed
          forecast information would be delivered. In production, you can
          customize email preferences and frequency in your account settings.
        </p>
      </div>
    </div>
  );
}
