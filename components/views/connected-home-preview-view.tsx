'use client';

import { useState } from 'react';
import { Battery, Car, LockKeyhole, Sun, Thermometer } from 'lucide-react';

import { EVENT_NAMES } from '@/domain/event';
import { useLocalActionFeedback } from '@/hooks/use-local-action-feedback';
import { navigateToScenario } from '@/lib/scenario-router';
import type { DemoScenario } from '@/domain/scenario';

export function ConnectedHomePreviewView({
  scenario,
}: {
  scenario: DemoScenario;
}) {
  const preview = scenario.futurePreview;
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const { actionStatus, recordLocalAction } = useLocalActionFeedback(scenario);

  if (!preview || preview.kind !== 'connected-home') {
    return null;
  }

  const assets = [
    {
      label: 'Electric vehicle',
      present: scenario.household.hasEV === true,
      icon: Car,
    },
    {
      label: 'Smart thermostat',
      present: scenario.household.hasSmartThermostat === true,
      icon: Thermometer,
    },
    {
      label: 'Solar',
      present: scenario.household.hasSolar === true,
      icon: Sun,
    },
    {
      label: 'Battery',
      present: scenario.household.hasBattery === true,
      icon: Battery,
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="connected-preview-title">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
        <p className="font-semibold">
          Future expansion preview — not part of the MVP pilot.
        </p>
        <p className="mt-1 text-sm">Not available in the MVP.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2
          id="connected-preview-title"
          className="text-2xl font-semibold text-navy"
        >
          Connected-Home Preview
        </h2>
        <p className="mt-2 text-gray-700">
          This concept could coordinate consented household assets without
          taking control away from the customer.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {assets.map(({ label, present, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <Icon className="text-navy" aria-hidden="true" />
              <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-gray-600">
                  {present ? 'Present in synthetic profile' : 'Not present'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
          role="status"
        >
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 text-navy" aria-hidden="true" />
            <div>
              <p className="font-semibold">Personalization is suppressed</p>
              <p className="mt-1 text-sm text-gray-700">
                Connected-device consent is absent. No personalized device
                recommendation, live telemetry, partner transfer, or device
                command is available.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Future dependency: {preview.partnerDependency}. This preview does not
          fabricate device data and cannot enroll or control any device.
        </p>

        <div className="mt-6 space-y-2">
          {[
            [
              'capabilities',
              'Capability details',
              'A future governed service could coordinate approved device schedules while preserving customer control.',
            ],
            [
              'data',
              'Data requirements',
              'Fresh device telemetry and authoritative tariff context would be required. Neither is connected here.',
            ],
            [
              'consent',
              'Consent requirements',
              'Connected-device access must be purpose-specific, explicit, current, and revocable.',
            ],
            [
              'partner',
              'Partner dependencies',
              `${preview.partnerDependency}. Partner referral remains declined and no transfer occurs.`,
            ],
            [
              'workflow',
              'Future workflow',
              'Review → permission check → explicit confirmation → governed execution → audit and rollback.',
            ],
          ].map(([id, label, description]) => (
            <div key={id} className="rounded-lg border">
              <button
                onClick={() =>
                  setOpenDetail((current) => (current === id ? null : id))
                }
                data-interaction-id={`connected-${id}`}
                className="focus-visible w-full p-4 text-left font-semibold"
                aria-expanded={openDetail === id}
              >
                {label}
              </button>
              {openDetail === id && (
                <p className="border-t p-4 text-sm text-gray-700">
                  {description}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigateToScenario('consent')}
            data-interaction-id="connected-manage-permissions"
            className="btn-outline"
          >
            Manage permissions
          </button>
          <button
            onClick={() =>
              recordLocalAction(
                EVENT_NAMES.ADVISOR_REQUESTED,
                'Your connected-home advisor preference was saved in this prototype. No external request or partner transfer was sent.'
              )
            }
            data-interaction-id="connected-advisor-support"
            className="btn-primary"
          >
            Ask an advisor
          </button>
        </div>
        {actionStatus && (
          <p className="mt-3 text-sm text-blue-800" role="status">
            {actionStatus}
          </p>
        )}
      </div>
    </section>
  );
}
