'use client';

import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { navigateToScenario, type ScenarioId } from '@/lib/scenario-router';

const sequence = [
  { id: 'baseline', name: 'Baseline Forecast' },
  { id: 'alert', name: 'Material-Change Alert' },
  { id: 'safety', name: 'Safety Guardrail' },
] as const;

export function PresentationNavigation({
  currentScenario,
  onReset,
}: {
  currentScenario: string;
  onReset: () => void;
}) {
  const index = sequence.findIndex((item) => item.id === currentScenario);
  const previous = sequence[index - 1];
  const next = sequence[index + 1];

  return (
    <nav
      className="no-print sticky top-0 z-40 border-b border-blue-200 bg-blue-50/95 shadow-sm backdrop-blur"
      aria-label="Guided demo navigation"
      data-demo-utility
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <div className="text-sm font-semibold text-navy">
          {index >= 0
            ? `${index + 1} of 3 — ${sequence[index].name}`
            : 'Supporting demo state'}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {index >= 0 && previous && (
            <button
              onClick={() =>
                navigateToScenario(previous.id as ScenarioId, true)
              }
              data-interaction-id="presentation-previous"
              className="focus-visible inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Previous: {previous.name}
            </button>
          )}
          {index >= 0 && next && (
            <button
              onClick={() => navigateToScenario(next.id as ScenarioId, true)}
              data-interaction-id="presentation-next"
              className="focus-visible inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100"
            >
              Next: {next.name}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          <Link
            href="/demo"
            prefetch={false}
            data-interaction-id="presentation-overview"
            className="focus-visible inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-blue-900 underline hover:bg-blue-100"
          >
            {index === sequence.length - 1
              ? 'Return to demo overview'
              : 'Back to demo overview'}
          </Link>
          <button
            onClick={() => {
              if (window.confirm('Reset Bill Control prototype data?')) {
                onReset();
              }
            }}
            data-interaction-id="presentation-reset"
            className="focus-visible inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset demo
          </button>
        </div>
      </div>
    </nav>
  );
}
