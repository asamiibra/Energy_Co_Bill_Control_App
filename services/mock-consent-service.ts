import type { ConsentState } from '@/domain/consent';
import type { DemoScenario } from '@/domain/scenario';

/**
 * Mock Consent Service
 *
 * Owns:
 * - Permission state
 * - Purpose
 * - Source
 * - Granted time
 * - Revoked time
 * - Preference version
 */

export class MockConsentService {
  private updatePermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose'],
    status: ConsentState['permissions'][0]['status'],
    occurredAt: string
  ): ConsentState {
    const existing = consentState.permissions.find(
      (permission) => permission.purpose === purpose
    );

    if (!existing) {
      throw new Error(`Unsupported permission purpose: ${purpose}`);
    }

    const versionMatch = consentState.consentVersionId.match(/^(.*-V)(\d+)$/);
    if (!versionMatch) {
      throw new Error(
        `Unsupported consent version: ${consentState.consentVersionId}`
      );
    }

    const permissions = consentState.permissions.map((permission) => {
      if (permission.purpose !== purpose) {
        return permission;
      }

      return {
        ...permission,
        previousStatus: permission.status,
        status,
        grantedAt: status === 'granted' ? occurredAt : permission.grantedAt,
        declinedAt: status === 'declined' ? occurredAt : permission.declinedAt,
        revokedAt: status === 'revoked' ? occurredAt : undefined,
        restoredAt:
          status === 'granted' &&
          (permission.status === 'revoked' || permission.status === 'declined')
            ? occurredAt
            : permission.restoredAt,
      };
    });

    return {
      consentVersionId: `${versionMatch[1]}${Number(versionMatch[2]) + 1}`,
      updatedAt: occurredAt,
      permissions,
    };
  }

  /**
   * Get consent state for a scenario
   */
  getConsentState(scenario: DemoScenario): ConsentState {
    return scenario.consentState;
  }

  /**
   * Check if specific permission is granted
   */
  hasPermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose']
  ): boolean {
    const permission = consentState.permissions.find(
      (p) => p.purpose === purpose
    );
    return permission?.status === 'granted';
  }

  /**
   * Grant permission (local storage only in MVP)
   */
  grantPermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose'],
    occurredAt = new Date().toISOString()
  ): ConsentState {
    return this.updatePermission(consentState, purpose, 'granted', occurredAt);
  }

  /**
   * Revoke permission (local storage only in MVP)
   */
  revokePermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose'],
    occurredAt = new Date().toISOString()
  ): ConsentState {
    return this.updatePermission(consentState, purpose, 'revoked', occurredAt);
  }

  /**
   * Decline permission
   */
  declinePermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose'],
    occurredAt = new Date().toISOString()
  ): ConsentState {
    return this.updatePermission(consentState, purpose, 'declined', occurredAt);
  }

  restorePermission(
    consentState: ConsentState,
    purpose: ConsentState['permissions'][0]['purpose'],
    occurredAt = new Date().toISOString()
  ): ConsentState {
    const permission = consentState.permissions.find(
      (candidate) => candidate.purpose === purpose
    );

    if (
      !permission ||
      (permission.status !== 'revoked' && permission.status !== 'declined')
    ) {
      throw new Error(`Permission ${purpose} is not restorable`);
    }

    return this.updatePermission(consentState, purpose, 'granted', occurredAt);
  }

  /**
   * Get permissions by status
   */
  getPermissionsByStatus(
    consentState: ConsentState,
    status: 'granted' | 'declined' | 'not_requested' | 'revoked'
  ): ConsentState['permissions'] {
    return consentState.permissions.filter((p) => p.status === status);
  }

  /**
   * Check if customer has granted essential permissions for forecast
   */
  hasEssentialForecastPermissions(consentState: ConsentState): boolean {
    return this.hasPermission(consentState, 'interval_meter_personalization');
  }

  /**
   * Get permission summary for display
   */
  getPermissionsSummary(consentState: ConsentState): {
    granted: number;
    declined: number;
    notRequested: number;
    revoked: number;
  } {
    const summary = {
      granted: 0,
      declined: 0,
      notRequested: 0,
      revoked: 0,
    };

    consentState.permissions.forEach((p) => {
      if (p.status === 'granted') summary.granted++;
      else if (p.status === 'declined') summary.declined++;
      else if (p.status === 'not_requested') summary.notRequested++;
      else if (p.status === 'revoked') summary.revoked++;
    });

    return summary;
  }
}

export const mockConsentService = new MockConsentService();
