'use client';

import { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { auditLedger } from '@/services/audit-ledger';
import type { DemoScenario } from '@/domain/scenario';
import type { ConsentPermission } from '@/domain/consent';
import { mockConsentService } from '@/services/mock-consent-service';
import { EVENT_NAMES } from '@/domain/event';

interface ConsentPreferencesViewProps {
  scenario: DemoScenario;
}

export function ConsentPreferencesView({
  scenario: initialScenario,
}: ConsentPreferencesViewProps) {
  const [scenario, setScenario] = useState(initialScenario);
  const [expandedPermission, setExpandedPermission] = useState<string | null>(
    null
  );
  const [showImpact, setShowImpact] = useState<string | null>(null);

  const handleTogglePermission = (
    purpose: ConsentPermission['purpose'],
    currentStatus: ConsentPermission['status']
  ) => {
    const updatedConsent =
      currentStatus === 'granted'
        ? mockConsentService.revokePermission(scenario.consentState, purpose)
        : currentStatus === 'revoked' || currentStatus === 'declined'
          ? mockConsentService.restorePermission(scenario.consentState, purpose)
          : mockConsentService.grantPermission(scenario.consentState, purpose);

    const newStatus = updatedConsent.permissions.find(
      (permission) => permission.purpose === purpose
    )?.status;

    setScenario({ ...scenario, consentState: updatedConsent });

    // Record audit event
    const eventName =
      newStatus === 'revoked'
        ? EVENT_NAMES.CONSENT_REVOKED
        : currentStatus === 'revoked' || currentStatus === 'declined'
          ? EVENT_NAMES.CONSENT_RESTORED
          : EVENT_NAMES.CONSENT_GRANTED;

    auditLedger.recordEvent(eventName, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      consentVersionId: updatedConsent.consentVersionId,
      properties: {
        purpose,
        previousStatus: currentStatus,
        newStatus,
      },
    });

    // Show impact message
    setShowImpact(purpose);
    setTimeout(() => setShowImpact(null), 5000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      granted: (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          <Check size={12} className="mr-1" />
          Granted
        </span>
      ),
      declined: (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
          <X size={12} className="mr-1" />
          Declined
        </span>
      ),
      revoked: (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
          <X size={12} className="mr-1" />
          Revoked
        </span>
      ),
      not_requested: (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
          Not requested
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || null;
  };

  const getImpactMessage = (permission: ConsentPermission) => {
    if (permission.status === 'granted') {
      return (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <strong>Active:</strong> {permission.benefit}
        </div>
      );
    }

    if (permission.status === 'revoked' || permission.status === 'declined') {
      return (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <strong>Impact:</strong> {permission.revokeImpact}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield size={24} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-blue-900">
              Your data and permissions
            </h2>
            <p className="text-sm text-blue-800">
              Control how Bill Control uses your data. Every permission is
              optional, revocable, and purpose-specific. You can change these
              settings at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Current Consent Version */}
      <div className="card bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>Consent version:</strong>{' '}
            {scenario.consentState.consentVersionId}
          </div>
          <div className="text-xs text-gray-500">
            Updates automatically when you change permissions
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {scenario.consentState.permissions.map((permission) => (
          <div key={permission.purpose} className="card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {permission.purpose
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </h3>
                  {getStatusBadge(permission.status)}
                  {permission.required && (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {permission.description}
                </p>
              </div>

              <button
                onClick={() =>
                  setExpandedPermission(
                    expandedPermission === permission.purpose
                      ? null
                      : permission.purpose
                  )
                }
                className="focus-visible ml-4 p-2 text-gray-400 hover:text-gray-600"
                aria-label={
                  expandedPermission === permission.purpose
                    ? 'Show less'
                    : 'Show more'
                }
              >
                {expandedPermission === permission.purpose ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {expandedPermission === permission.purpose && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {/* Detailed Information */}
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <h4 className="mb-1 font-medium text-gray-900">
                      Data used
                    </h4>
                    <p className="text-gray-600">{permission.dataUsed}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium text-gray-900">
                      Your benefit
                    </h4>
                    <p className="text-gray-600">{permission.benefit}</p>
                  </div>
                </div>

                {/* Current Impact */}
                {showImpact === permission.purpose &&
                  getImpactMessage(permission)}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    {permission.status === 'granted' &&
                      permission.grantedAt && (
                        <span>
                          Granted on{' '}
                          {new Date(permission.grantedAt).toLocaleDateString()}
                        </span>
                      )}
                    {permission.status === 'revoked' &&
                      permission.revokedAt && (
                        <span>
                          Revoked on{' '}
                          {new Date(permission.revokedAt).toLocaleDateString()}
                        </span>
                      )}
                    {permission.status === 'declined' &&
                      permission.declinedAt && (
                        <span>
                          Declined on{' '}
                          {new Date(permission.declinedAt).toLocaleDateString()}
                        </span>
                      )}
                    {permission.status === 'not_requested' && (
                      <span>Not yet requested</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {permission.status === 'granted' && (
                      <button
                        onClick={() =>
                          handleTogglePermission(
                            permission.purpose,
                            permission.status
                          )
                        }
                        className="focus-visible rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
                      >
                        Revoke permission
                      </button>
                    )}

                    {(permission.status === 'declined' ||
                      permission.status === 'revoked' ||
                      permission.status === 'not_requested') && (
                      <button
                        onClick={() =>
                          handleTogglePermission(
                            permission.purpose,
                            permission.status
                          )
                        }
                        className="btn-primary text-sm"
                      >
                        Grant permission
                      </button>
                    )}
                  </div>
                </div>

                {/* Impact Preview */}
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start space-x-2">
                    <Info
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-blue-600"
                    />
                    <div className="text-sm text-blue-800">
                      <strong>
                        If you{' '}
                        {permission.status === 'granted' ? 'revoke' : 'grant'}{' '}
                        this permission:
                      </strong>
                      <p className="mt-1">
                        {permission.status === 'granted'
                          ? permission.revokeImpact
                          : permission.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dependent Recommendations Warning */}
      <div className="card border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 flex-shrink-0 text-yellow-600"
          />
          <div>
            <h3 className="mb-1 font-semibold text-yellow-900">
              Some recommendations require specific permissions
            </h3>
            <p className="text-sm text-yellow-800">
              For example, smart thermostat recommendations require
              &quot;Connected device access&quot; to be granted. Revoking
              permissions will make dependent recommendations unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Data Quality Impact Example */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Example: Interval-meter personalization impact
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span className="font-medium text-green-900">
                Permission granted
              </span>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <p>
                <strong>Data quality:</strong> Full
              </p>
              <p>
                <strong>Expected range:</strong> Narrow (±15%)
              </p>
              <p>
                <strong>Recommendations:</strong> Personalized and precise
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <X size={16} className="text-orange-600" />
              <span className="font-medium text-orange-900">
                Permission revoked
              </span>
            </div>
            <div className="space-y-2 text-sm text-orange-800">
              <p>
                <strong>Data quality:</strong> Limited
              </p>
              <p>
                <strong>Expected range:</strong> Wider (±30%)
              </p>
              <p>
                <strong>Recommendations:</strong> Directional only
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            <strong>Demo note:</strong> This is a simulated comparison. In
            production, revoking interval-meter personalization would trigger a
            data-quality evaluation and update your forecast accordingly.
          </p>
        </div>
      </div>

      {/* Privacy Commitment */}
      <div className="card border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Energy Co&apos;s privacy commitment
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            • All consent is purpose-specific. We will not use your data for
            purposes you haven&apos;t approved.
          </p>
          <p>
            • You can revoke any optional permission at any time. Changes take
            effect immediately.
          </p>
          <p>
            • Bill Control stores your preferences locally in this demo. In
            production, consent is securely stored and versioned.
          </p>
          <p>
            • We never share your usage data with third parties without your
            explicit consent.
          </p>
          <p>
            • You have the right to request a copy of your data, correct
            inaccuracies, or request deletion.
          </p>
        </div>

        <button className="focus-visible mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
          View full privacy policy →
        </button>
      </div>

      {/* Support */}
      <div className="card border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Questions about your data or permissions?
        </h3>
        <p className="mb-4 text-sm text-gray-700">
          Our privacy team can help you understand how your data is used and
          what options are available.
        </p>
        <button className="btn-primary">Contact privacy team</button>
      </div>
    </div>
  );
}
