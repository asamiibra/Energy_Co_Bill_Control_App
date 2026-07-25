'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

type DialogKind =
  'budget_plan' | 'assistance_programs' | 'safe_alternatives' | 'advisor';

const content = {
  budget_plan: {
    title: 'Explore budget-plan support',
    description:
      'Budget billing may spread expected energy costs into steadier monthly amounts.',
    items: [
      'Eligibility may consider account standing and billing history.',
      'Actual monthly amounts can still change after periodic reviews.',
      'This prototype does not check eligibility or submit an application.',
    ],
  },
  assistance_programs: {
    title: 'Review assistance programs',
    description:
      'Illustrative support categories that an advisor could help you explore.',
    items: [
      'Energy assistance',
      'Hardship support',
      'Payment-plan support',
      'Advisor help',
    ],
  },
  safe_alternatives: {
    title: 'View low-impact alternatives',
    description:
      'These options do not reduce essential heating and include no savings claim.',
    items: [
      'Review non-essential appliance timing.',
      'Check lighting and standby usage.',
      'Inspect draft sealing or insulation guidance.',
      'Ask an advisor to review additional options.',
    ],
  },
  advisor: {
    title: 'Speak with an advisor',
    description:
      'Choose an illustrative support preference. No external request will be sent.',
    items: [],
  },
} satisfies Record<
  DialogKind,
  { title: string; description: string; items: string[] }
>;

export function SafetySupportDialog({
  kind,
  onClose,
  onSave,
}: {
  kind: DialogKind;
  onClose: () => void;
  onSave: (preference?: 'call' | 'message' | 'contact_information') => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const [preference, setPreference] = useState<
    'call' | 'message' | 'contact_information'
  >('call');
  const dialog = content[kind];

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-support-title"
        className="mx-auto mt-12 max-w-lg rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 id="safety-support-title" className="text-xl font-semibold">
              {dialog.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{dialog.description}</p>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            data-interaction-id="safety-dialog-close"
            className="focus-visible min-h-11 min-w-11 rounded-md p-2"
            aria-label="Close support dialog"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {dialog.items.length > 0 && (
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              {dialog.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {kind === 'advisor' && (
            <fieldset className="space-y-2">
              <legend className="font-medium">Support preference</legend>
              {[
                ['call', 'Call me'],
                ['message', 'Message me'],
                ['contact_information', 'Show contact information'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-11 items-center gap-3 rounded-lg border p-3"
                >
                  <input
                    type="radio"
                    name="advisor-preference"
                    value={value}
                    checked={preference === value}
                    onChange={() =>
                      setPreference(
                        value as 'call' | 'message' | 'contact_information'
                      )
                    }
                    data-interaction-id={`safety-advisor-preference-${value}`}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          )}

          {kind === 'safe_alternatives' ? (
            <button
              onClick={onClose}
              data-interaction-id="safety-alternatives-done"
              className="btn-primary w-full"
            >
              Done
            </button>
          ) : (
            <button
              onClick={() =>
                onSave(kind === 'advisor' ? preference : undefined)
              }
              data-interaction-id={`safety-save-${kind}`}
              className="btn-primary w-full"
            >
              {kind === 'advisor' ? 'Save preference' : 'Save my interest'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
