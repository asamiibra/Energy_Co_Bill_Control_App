'use client';

import { useState } from 'react';

import type { DemoScenario } from '@/domain/scenario';
import { auditLedger } from '@/services/audit-ledger';

type ActionOptions = {
  properties?: Record<string, unknown>;
  reminder?: boolean;
};

const reminderStorageKey = 'bill-control-local-reminders';

export function useLocalActionFeedback(scenario: DemoScenario) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const recordLocalAction = (
    eventName: string,
    message: string,
    options: ActionOptions = {}
  ) => {
    auditLedger.recordEvent(eventName, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
      policyDecisionId: scenario.safetyDecision.policyDecisionId,
      consentVersionId: scenario.consentState.consentVersionId,
      properties: {
        executionMode: 'local_intent_only',
        ...options.properties,
      },
    });

    if (options.reminder) {
      try {
        const raw = localStorage.getItem(reminderStorageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const reminders = Array.isArray(parsed) ? parsed : [];
        reminders.push({
          scenarioId: scenario.scenarioId,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(reminderStorageKey, JSON.stringify(reminders));
      } catch {
        // Feedback and audit remain available when persistence is unavailable.
      }
    }

    setActionStatus(message);
  };

  return { actionStatus, recordLocalAction };
}
