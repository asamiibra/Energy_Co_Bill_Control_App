'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  getAvailableScenarios,
  navigateToScenario,
} from '@/lib/scenario-router';
import { AuditViewer } from './audit-viewer';

interface DemoSwitcherProps {
  currentScenario: string;
  presentationMode: boolean;
  onReset: () => void;
}

export function DemoSwitcher({
  currentScenario,
  presentationMode,
  onReset,
}: DemoSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const scenarios = getAvailableScenarios();

  const handleScenarioChange = (scenarioId: string) => {
    navigateToScenario(
      scenarioId as Parameters<typeof navigateToScenario>[0],
      presentationMode
    );
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        presentationMode &&
        event.shiftKey &&
        event.key.toLowerCase() === 'd'
      ) {
        event.preventDefault();
        setIsAuditOpen(false);
        setIsOpen((current) => !current);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setIsAuditOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode]);

  // Group scenarios
  const p0Scenarios = scenarios.filter((s) => s.group === 'P0');
  const p1Scenarios = scenarios.filter((s) => s.group === 'P1');
  const futureScenarios = scenarios.filter((s) => s.group === 'Future');

  return (
    <div className="relative" data-demo-utility>
      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full z-20 mt-1 max-h-96 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              {/* P0 Group */}
              <div className="mb-3">
                <div className="mb-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-gray-700">
                  90-Second Demo Path
                </div>
                {p0Scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioChange(scenario.id)}
                    data-interaction-id={`demo-scenario-${scenario.id}`}
                    disabled={!scenario.available}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      currentScenario === scenario.id
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : scenario.available
                          ? 'text-gray-900 hover:bg-gray-50'
                          : 'cursor-not-allowed text-gray-400'
                    } `}
                  >
                    {scenario.name}
                    {!scenario.available && (
                      <span className="ml-2 text-xs">(Coming Soon)</span>
                    )}
                  </button>
                ))}
              </div>

              {/* P1 Group */}
              <div className="mb-3">
                <div className="mb-1 rounded bg-green-50 px-2 py-1 text-xs font-semibold text-gray-700">
                  MVP Resilience States
                </div>
                {p1Scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioChange(scenario.id)}
                    data-interaction-id={`demo-scenario-${scenario.id}`}
                    disabled={!scenario.available}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      currentScenario === scenario.id
                        ? 'bg-green-50 font-medium text-green-700'
                        : scenario.available
                          ? 'text-gray-900 hover:bg-gray-50'
                          : 'cursor-not-allowed text-gray-400'
                    } `}
                  >
                    {scenario.name}
                    {!scenario.available && (
                      <span className="ml-2 text-xs">(Coming Soon)</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Future Group */}
              <div>
                <div className="mb-1 rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                  Future Previews
                </div>
                {futureScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioChange(scenario.id)}
                    data-interaction-id={`demo-scenario-${scenario.id}`}
                    disabled={!scenario.available}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      currentScenario === scenario.id
                        ? 'bg-gray-100 font-medium text-gray-900'
                        : scenario.available
                          ? 'text-gray-900 hover:bg-gray-50'
                          : 'cursor-not-allowed text-gray-400'
                    } `}
                  >
                    {scenario.name}
                    <span className="ml-2 text-xs">(Preview)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAuditOpen(true);
                }}
                data-interaction-id="demo-audit-viewer-open"
                className="min-h-11 w-full rounded-md px-2 py-2 text-left text-sm font-medium text-navy hover:bg-gray-50"
              >
                Open interviewer audit viewer
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Reset only Bill Control prototype data and return to Baseline Forecast?'
                    )
                  ) {
                    setIsOpen(false);
                    setIsAuditOpen(false);
                    onReset();
                  }
                }}
                data-interaction-id="demo-reset"
                className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-navy hover:bg-gray-50"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reset prototype
              </button>
              <div className="px-2 py-1 text-xs text-gray-500">
                This switcher is for demonstration purposes and would not appear
                in the customer product. Press Shift + D to toggle and Escape to
                close.
              </div>
            </div>
          </div>
        </>
      )}
      <AuditViewer open={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
}
