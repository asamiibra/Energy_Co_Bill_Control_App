'use client';

import { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  MessageCircle,
  Shield,
  Sparkles,
} from 'lucide-react';

import { EVENT_NAMES } from '@/domain/event';
import type { DemoScenario } from '@/domain/scenario';
import { auditLedger } from '@/services/audit-ledger';
import { buildEvidenceLedger } from '@/services/explanation-evidence-ledger';
import { generateSafetyExplanation } from '@/services/explanation-presenter';
import { saveSupportIntent } from '@/services/local-support-intent-service';
import { ForecastRangeVisualization } from '../forecast-range-visualization';
import { SafetySupportDialog } from '../safety-support-dialog';

type DialogKind =
  'budget_plan' | 'assistance_programs' | 'safe_alternatives' | 'advisor';

export function SafetyGuardrailView({ scenario }: { scenario: DemoScenario }) {
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [showDecision, setShowDecision] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const explanation = generateSafetyExplanation(buildEvidenceLedger(scenario));

  useEffect(() => {
    auditLedger.recordEventOnce(EVENT_NAMES.SAFETY_STATE_VIEWED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      policyDecisionId: scenario.safetyDecision.policyDecisionId,
    });
    auditLedger.recordEventOnce(EVENT_NAMES.RECOMMENDATION_SUPPRESSED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      policyDecisionId: scenario.safetyDecision.policyDecisionId,
      recommendationId: scenario.recommendations.find(
        (recommendation) => recommendation.status === 'suppressed'
      )?.recommendationId,
      properties: {
        policySource: 'customer_declared_essential_use',
        suppressionReason: scenario.safetyDecision.reasonCode,
        suppressedRecommendationTitle: scenario.recommendations.find(
          (recommendation) => recommendation.status === 'suppressed'
        )?.title,
        safeAlternatives: scenario.recommendations
          .filter((recommendation) => recommendation.status === 'available')
          .map((recommendation) => recommendation.recommendationId),
      },
    });
  }, [scenario]);

  const openDialog = (kind: DialogKind) => {
    setConfirmation(null);
    setDialog(kind);
    if (kind === 'safe_alternatives') {
      auditLedger.recordEvent(EVENT_NAMES.SAFE_ALTERNATIVE_SELECTED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        policyDecisionId: scenario.safetyDecision.policyDecisionId,
        properties: { option: 'low_impact_alternatives' },
      });
    }
  };

  const saveIntent = (
    kind: Exclude<DialogKind, 'safe_alternatives'>,
    preference?: 'call' | 'message' | 'contact_information'
  ) => {
    saveSupportIntent({
      scenarioId: scenario.scenarioId,
      kind,
      preference,
    });

    auditLedger.recordEvent(
      kind === 'advisor'
        ? EVENT_NAMES.ADVISOR_REQUESTED
        : EVENT_NAMES.SUPPORT_OPTION_SELECTED,
      {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        policyDecisionId: scenario.safetyDecision.policyDecisionId,
        properties: {
          option: kind,
          preference,
          executionMode: 'local_intent_only',
        },
      }
    );

    setConfirmation(
      kind === 'budget_plan'
        ? 'Your interest in budget-plan support was saved in this prototype. No application was submitted.'
        : kind === 'assistance_programs'
          ? 'Your interest in support programs was saved in this prototype. No application was submitted.'
          : 'Your advisor-support preference was saved in this prototype. No external request was sent.'
    );
    setDialog(null);
  };

  return (
    <div className="space-y-4">
      <section
        className="rounded-xl border border-blue-200 bg-blue-50 p-5"
        aria-labelledby="safety-title"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Shield className="text-blue-700" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="safety-title" className="text-xl text-blue-950">
              Essential-use protection active
            </h2>
            <p className="mt-2 font-medium text-blue-900">
              We are not recommending changes to essential heating under current
              conditions.
            </p>
            <p className="mt-2 text-sm text-blue-800">
              Customer safety and comfort come first. Recommendations that could
              reduce essential heating have been withheld. No automatic action
              has been taken.
            </p>
          </div>
        </div>
      </section>

      <section className="card p-5" aria-labelledby="safety-forecast-title">
        <div className="grid gap-5 md:grid-cols-2 md:items-center">
          <div>
            <h3 id="safety-forecast-title" className="text-lg">
              Current forecast
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {explanation.forecastSummary}
            </p>
            <div className="mt-3 text-sm text-gray-700">
              Winter period · {scenario.forecast.daysRemaining} days remaining ·{' '}
              {scenario.forecast.dataQualityTier} data
            </div>
          </div>
          <ForecastRangeVisualization
            expectedBill={scenario.forecast.expectedBill}
            range={scenario.forecast.expectedRange}
          />
        </div>
      </section>

      <section className="card p-5" aria-labelledby="safe-next-steps-title">
        <div>
          <h3 id="safe-next-steps-title" className="text-lg">
            Safe next steps
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Choose a local prototype pathway. Nothing is submitted externally.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              kind: 'budget_plan' as const,
              title: 'Explore budget-plan support',
              description: 'Review illustrative budget-billing considerations.',
              icon: BadgeDollarSign,
            },
            {
              kind: 'assistance_programs' as const,
              title: 'Review assistance programs',
              description: 'Explore assistance and payment-support categories.',
              icon: HeartHandshake,
            },
            {
              kind: 'safe_alternatives' as const,
              title: 'View low-impact alternatives',
              description: 'See options that do not reduce essential heating.',
              icon: Sparkles,
            },
          ].map(({ kind, title, description, icon: Icon }) => (
            <button
              key={kind}
              onClick={() => openDialog(kind)}
              data-interaction-id={`safety-open-${kind}`}
              className="focus-visible rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"
            >
              <Icon className="text-blue-700" aria-hidden="true" />
              <span className="mt-3 block font-medium">{title}</span>
              <span className="mt-1 block text-sm text-gray-600">
                {description}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => openDialog('advisor')}
          data-interaction-id="safety-open-advisor"
          className="focus-visible mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 font-medium text-white hover:bg-navy-600"
        >
          <MessageCircle aria-hidden="true" />
          Speak with an advisor
        </button>

        {confirmation && (
          <div
            className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
            role="status"
          >
            {confirmation}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => {
            setShowDecision((current) => !current);
            auditLedger.recordEvent(EVENT_NAMES.SAFETY_REASON_VIEWED, {
              scenarioId: scenario.scenarioId,
              householdId: scenario.household.customerId,
              policyDecisionId: scenario.safetyDecision.policyDecisionId,
            });
          }}
          data-interaction-id="safety-decision-explanation"
          className="focus-visible flex w-full items-center justify-between p-4 text-left"
          aria-expanded={showDecision}
        >
          <span className="font-medium">How was this decision made?</span>
          {showDecision ? (
            <ChevronUp aria-hidden="true" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
        </button>
        {showDecision && (
          <div className="border-t px-4 pb-4 pt-3 text-sm text-gray-700">
            Essential-use protection is active for this account, so Bill Control
            has withheld recommendations that could reduce essential heating.
            You remain in control of your energy use and account preferences.
            <p className="mt-3 font-medium text-gray-800">
              A heating-reduction recommendation was withheld.
            </p>
          </div>
        )}
      </section>

      {dialog && (
        <SafetySupportDialog
          kind={dialog}
          onClose={() => setDialog(null)}
          onSave={(preference) =>
            saveIntent(
              dialog as Exclude<DialogKind, 'safe_alternatives'>,
              preference
            )
          }
        />
      )}
    </div>
  );
}
