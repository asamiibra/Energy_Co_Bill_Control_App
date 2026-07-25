import { describe, expect, it } from 'vitest';

import { scenarios } from '@/data/scenarios';
import { MockConsentService } from '@/services/mock-consent-service';
import { MockPolicyService } from '@/services/mock-policy-service';
import {
  evaluateForecastUsefulness,
  filterRecommendationsByConsent,
} from '@/services/policy-service';
import { ActionIntentService } from '@/services/action-intent-service';

describe('consent, policy, and action boundaries', () => {
  it('supports all six purpose-specific permissions', () => {
    expect(
      scenarios.consent.consentState.permissions.map(
        (permission) => permission.purpose
      )
    ).toEqual([
      'interval_meter_personalization',
      'bill_alert_reminders',
      'advisor_follow_up',
      'connected_device_access',
      'tariff_recommendation',
      'partner_referral',
    ]);
    scenarios.consent.consentState.permissions.forEach((permission) => {
      expect(permission.description).toBeTruthy();
      expect(permission.dataUsed).toBeTruthy();
      expect(permission.benefit).toBeTruthy();
      expect(permission.required).toBe(false);
      expect(permission.revokeImpact).toBeTruthy();
    });
  });

  it('grants, declines, revokes, and restores with version history', () => {
    const service = new MockConsentService();
    const initial = scenarios.consent.consentState;
    const revoked = service.revokePermission(
      initial,
      'interval_meter_personalization',
      '2026-07-25T10:00:00Z'
    );
    expect(revoked.consentVersionId).toBe('CONSENT-ALEX-V4');
    expect(
      revoked.permissions.find(
        (permission) => permission.purpose === 'interval_meter_personalization'
      )
    ).toMatchObject({
      status: 'revoked',
      previousStatus: 'granted',
      revokedAt: '2026-07-25T10:00:00Z',
    });

    const restored = service.restorePermission(
      revoked,
      'interval_meter_personalization',
      '2026-07-25T11:00:00Z'
    );
    expect(restored.consentVersionId).toBe('CONSENT-ALEX-V5');
    expect(
      restored.permissions.find(
        (permission) => permission.purpose === 'interval_meter_personalization'
      )
    ).toMatchObject({
      status: 'granted',
      previousStatus: 'revoked',
      restoredAt: '2026-07-25T11:00:00Z',
    });

    const declined = service.declinePermission(
      restored,
      'partner_referral',
      '2026-07-25T12:00:00Z'
    );
    expect(declined.consentVersionId).toBe('CONSENT-ALEX-V6');
  });

  it('enforces consent dependencies in policy logic', () => {
    const filtered = filterRecommendationsByConsent(
      scenarios.consent.recommendations,
      scenarios.consent
    );
    expect(
      filtered.find(
        (recommendation) =>
          recommendation.recommendationId === 'rec-consent-thermostat-001'
      )?.status
    ).toBe('unavailable');
  });

  it('suppresses essential-use and insufficient-data recommendations', () => {
    const policy = new MockPolicyService();
    expect(policy.hasEssentialUseProtection(scenarios.safety)).toBe(true);
    expect(policy.getSuppressedRecommendations(scenarios.safety)).toHaveLength(
      1
    );

    const insufficient = {
      ...scenarios['limited-data'],
      forecast: {
        ...scenarios['limited-data'].forecast,
        expectedRange: { low: 80, high: 280 },
        dataQualityTier: 'insufficient' as const,
      },
    };
    expect(evaluateForecastUsefulness(insufficient)).toMatchObject({
      usefulness: 'not_actionable',
      allowRecommendations: false,
      requiresSupport: true,
    });
  });

  it('rejects suppressed, unavailable, and future actions', () => {
    const service = new ActionIntentService();
    expect(() =>
      service.saveActionPlan(
        scenarios.safety.scenarioId,
        scenarios.safety.household.customerId,
        [scenarios.safety.recommendations[0]]
      )
    ).toThrow(/Only available MVP recommendations/);
    expect(() =>
      service.saveActionPlan(
        scenarios['tariff-preview'].scenarioId,
        scenarios['tariff-preview'].household.customerId,
        scenarios['tariff-preview'].recommendations
      )
    ).toThrow(/Only available MVP recommendations/);
  });
});
