'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

import { auditLedger } from '@/services/audit-ledger';

export function AuditViewer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const events = auditLedger.getSessionEvents();
  const eventSource = (eventName: string) => {
    if (
      eventName.includes('suppressed') ||
      eventName.includes('safety') ||
      eventName.includes('consent')
    ) {
      return 'Policy';
    }
    if (
      eventName.includes('forecast') ||
      eventName.includes('scenario') ||
      eventName.includes('faithfulness')
    ) {
      return 'System';
    }
    return 'Customer';
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 p-4"
      data-demo-utility
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-viewer-title"
        className="mx-auto flex max-h-[90vh] max-w-4xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 id="audit-viewer-title" className="text-lg font-semibold">
              Interviewer Audit Viewer
            </h2>
            <p className="text-sm text-gray-600">
              Local synthetic events only. Never shown in customer screenshots.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            data-interaction-id="audit-viewer-close"
            className="min-h-11 min-w-11 rounded-md p-2 hover:bg-gray-100"
            aria-label="Close audit viewer"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div
          className="overflow-auto p-4"
          role="region"
          aria-label="Audit event table"
          tabIndex={0}
        >
          {events.length === 0 ? (
            <p className="text-gray-600">No events recorded in this session.</p>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <caption className="sr-only">
                Audit events recorded in the current demo session
              </caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="p-2">
                    Source
                  </th>
                  <th scope="col" className="p-2">
                    Event
                  </th>
                  <th scope="col" className="p-2">
                    Scenario
                  </th>
                  <th scope="col" className="p-2">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.eventId} className="border-b align-top">
                    <td className="p-2">{eventSource(event.eventName)}</td>
                    <td className="p-2 font-medium">{event.eventName}</td>
                    <td className="p-2">{event.scenarioId}</td>
                    <td className="p-2 font-mono text-xs">
                      {JSON.stringify({
                        forecastVersionId: event.forecastVersionId,
                        recommendationId: event.recommendationId,
                        policyDecisionId: event.policyDecisionId,
                        consentVersionId: event.consentVersionId,
                        occurredAt: event.occurredAt,
                        ...event.properties,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
