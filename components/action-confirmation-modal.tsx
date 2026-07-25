'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';

import { formatCurrencyRange } from '@/lib/format-currency';
import { actionIntentService } from '@/services/action-intent-service';
import { auditLedger } from '@/services/audit-ledger';
import { EVENT_NAMES } from '@/domain/event';

import type { Recommendation } from '@/domain/recommendation';
import type { DemoScenario } from '@/domain/scenario';

interface ActionConfirmationModalProps {
  recommendation: Recommendation;
  scenario: DemoScenario;
  onClose: () => void;
}

export function ActionConfirmationModal({
  recommendation,
  scenario,
  onClose,
}: ActionConfirmationModalProps) {
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    auditLedger.recordEvent(EVENT_NAMES.RECOMMENDATION_SELECTED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      recommendationId: recommendation.recommendationId,
      forecastVersionId: scenario.forecast.forecastVersionId,
    });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, recommendation.recommendationId, scenario]);

  const handleSaveAction = () => {
    const existingPlan = actionIntentService
      .getPlansForScenario(scenario.scenarioId)
      .find((plan) => plan.status === 'saved' || plan.status === 'modified');
    const savedPlan = existingPlan
      ? actionIntentService.modifyActionPlan(existingPlan.planId, {
          recommendationIds: [recommendation.recommendationId],
          reminderDate,
          notes,
        })
      : actionIntentService.saveActionPlan(
          scenario.scenarioId,
          scenario.household.customerId,
          [recommendation],
          { reminderDate, notes }
        );

    if (!savedPlan) {
      return;
    }

    // Record audit event
    auditLedger.recordEvent(
      existingPlan
        ? EVENT_NAMES.ACTION_PLAN_MODIFIED
        : EVENT_NAMES.ACTION_PLAN_SAVED,
      {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        recommendationId: recommendation.recommendationId,
        forecastVersionId: scenario.forecast.forecastVersionId,
        properties: {
          planId: savedPlan.planId,
          hasReminder: !!reminderDate,
          hasNotes: !!notes,
        },
      }
    );

    setShowSuccess(true);

    // Auto-close after showing success
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-saved-title"
          className="w-full max-w-md rounded-lg bg-white p-6"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check size={24} className="text-green-600" />
            </div>
            <h3
              id="action-saved-title"
              className="mb-2 text-lg font-semibold text-gray-900"
            >
              Action Plan Saved
            </h3>
            <p className="text-gray-600">
              Your action plan has been saved. Remember, no automatic changes
              have been made to your thermostat or account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-action-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3
            id="save-action-title"
            className="text-lg font-semibold text-gray-900"
          >
            {actionIntentService.hasActivePlans(scenario.household.customerId)
              ? 'Update Action Plan'
              : 'Save Action Plan'}
          </h3>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            data-interaction-id="action-dialog-close"
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close save action dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Action Summary */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-1 font-medium text-gray-900">
              {recommendation.title}
            </h4>
            <p className="mb-2 text-sm text-gray-600">
              {recommendation.description}
            </p>
            {recommendation.benefit && (
              <div className="text-sm text-blue-700">
                Estimated benefit:{' '}
                {formatCurrencyRange(
                  recommendation.benefit.low,
                  recommendation.benefit.high
                )}
              </div>
            )}
          </div>

          {/* Assumptions */}
          {recommendation.benefit?.assumptions && (
            <div className="text-sm text-gray-600">
              <div className="mb-2 font-medium">This estimate assumes:</div>
              <ul className="ml-4 list-disc space-y-1">
                {recommendation.benefit.assumptions.map((assumption, i) => (
                  <li key={i}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="action-reminder-date"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Set reminder (optional)
              </label>
              <input
                id="action-reminder-date"
                type="date"
                data-interaction-id="action-dialog-reminder-date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label
                htmlFor="action-notes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="action-notes"
                data-interaction-id="action-dialog-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any personal notes about this action..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Saving this action does not
              automatically change your thermostat settings. You will need to
              manually adjust your thermostat to implement this plan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 border-t border-gray-200 p-6">
          <button
            onClick={handleSaveAction}
            data-interaction-id="action-dialog-save"
            className="focus-visible flex-1 rounded-md bg-navy px-4 py-2 text-white transition-colors hover:bg-navy-600"
          >
            Save Action Plan
          </button>
          <button
            onClick={onClose}
            data-interaction-id="action-dialog-cancel"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
