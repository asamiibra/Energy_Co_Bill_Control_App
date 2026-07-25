import { describe, expect, it, vi } from 'vitest';

import { EVENT_NAMES, PrototypeEventSchema } from '@/domain/event';
import { AuditLedger } from '@/services/audit-ledger';

describe('event and audit ledger', () => {
  it('defines every required event name', () => {
    expect(Object.values(EVENT_NAMES)).toEqual(
      expect.arrayContaining([
        'scenario_loaded',
        'message_preview_opened',
        'message_link_selected',
        'forecast_viewed',
        'forecast_revised',
        'material_change_alert_triggered',
        'forecast_surprise_recorded',
        'recommendation_selected',
        'action_plan_saved',
        'action_plan_modified',
        'action_plan_declined',
        'recommendation_suppressed',
        'advisor_requested',
        'consent_granted',
        'consent_declined',
        'consent_revoked',
        'consent_restored',
        'explanation_faithfulness_failed',
        'tariff_preview_viewed',
        'connected_home_preview_viewed',
        'personalized_tariff_preview_suppressed',
        'personalized_device_recommendation_suppressed',
      ])
    );
  });

  it('records a valid correlated envelope only once', () => {
    const ledger = new AuditLedger();
    const context = {
      scenarioId: 'baseline_alex_summer',
      householdId: 'CUST-ALEX-001',
      forecastVersionId: 'FCST-ALEX-20260725-01',
      policyDecisionId: 'POLICY-ALEX-BASELINE-001',
      consentVersionId: 'CONSENT-ALEX-V1',
    };
    const first = ledger.recordEventOnce(EVENT_NAMES.SCENARIO_LOADED, context);
    const duplicate = ledger.recordEventOnce(
      EVENT_NAMES.SCENARIO_LOADED,
      context
    );
    expect(first.eventId).toBe(duplicate.eventId);
    expect(ledger.getEventsByName(EVENT_NAMES.SCENARIO_LOADED)).toHaveLength(1);
    expect(PrototypeEventSchema.safeParse(first).success).toBe(true);
  });

  it('defers session ID generation until runtime use', () => {
    const randomUuid = vi.spyOn(crypto, 'randomUUID');
    randomUuid.mockClear();

    const ledger = new AuditLedger();

    expect(randomUuid).not.toHaveBeenCalled();
    expect(ledger.getSessionId()).toBeTruthy();
    expect(randomUuid).toHaveBeenCalledTimes(1);
  });

  it('survives malformed or unavailable local storage', () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce('{bad json');
    expect(() => new AuditLedger()).not.toThrow();
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new Error('quota');
    });
    const ledger = new AuditLedger();
    expect(() =>
      ledger.recordEvent(EVENT_NAMES.SCENARIO_LOADED, {
        scenarioId: 'baseline_alex_summer',
        householdId: 'CUST-ALEX-001',
      })
    ).not.toThrow();
  });
});
