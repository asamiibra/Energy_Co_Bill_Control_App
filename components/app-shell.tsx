'use client';

import { useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { HelpCircle, User, ChevronDown } from 'lucide-react';

import {
  getScenarioFromUrl,
  navigateToScenario,
  type ScenarioId,
} from '@/lib/scenario-router';
import { resetPrototypeLocalState } from '@/lib/prototype-storage';
import { SyntheticDataNotice } from './synthetic-data-notice';
import { DemoSwitcher } from './demo-switcher';
import { ScenarioDisplay } from './scenario-display';
import { MessagePreviews } from './message-previews';
import { auditLedger } from '@/services/audit-ledger';
import { actionIntentService } from '@/services/action-intent-service';
import { EVENT_NAMES } from '@/domain/event';

type AppShellProps = {
  initialScenarioId?: string;
  initialPresentationMode?: boolean;
};

const subscribeToHydration = () => () => {};

function getInitialSearchParams({
  initialScenarioId,
  initialPresentationMode,
}: AppShellProps): URLSearchParams {
  const params = new URLSearchParams();
  if (initialScenarioId) {
    params.set('scenario', initialScenarioId);
  }
  if (initialPresentationMode) {
    params.set('presentation', 'true');
  }
  return params;
}

export function AppShell({
  initialScenarioId,
  initialPresentationMode = false,
}: AppShellProps) {
  const searchParams = useSearchParams();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const initialSearchParams = getInitialSearchParams({
    initialScenarioId,
    initialPresentationMode,
  });
  const activeSearchParams = hydrated ? searchParams : initialSearchParams;
  const scenario = getScenarioFromUrl(activeSearchParams);
  const presentationMode = activeSearchParams.get('presentation') === 'true';
  const presentationPrepared = useRef(false);
  const [messagePreviewState, setMessagePreviewState] = useState({
    scenarioId: scenario?.scenarioId,
    visible: true,
  });
  const showMessagePreviews =
    !presentationMode &&
    (messagePreviewState.scenarioId === scenario?.scenarioId
      ? messagePreviewState.visible
      : true);

  const clearPrototypeState = useCallback(() => {
    actionIntentService.clearAllPlans();
    auditLedger.clearEvents();
    auditLedger.resetSession();
    resetPrototypeLocalState();
  }, []);

  useEffect(() => {
    if (presentationMode && !presentationPrepared.current) {
      clearPrototypeState();
      presentationPrepared.current = true;
    }
  }, [clearPrototypeState, presentationMode]);

  useEffect(() => {
    if (!presentationMode) {
      return;
    }

    const shortcuts: Record<string, ScenarioId> = {
      '1': 'baseline',
      '2': 'alert',
      '3': 'safety',
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const nextScenario = shortcuts[event.key];
      if (
        nextScenario &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        navigateToScenario(nextScenario, true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode]);

  useEffect(() => {
    if (scenario) {
      auditLedger.recordEventOnce(EVENT_NAMES.SCENARIO_LOADED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        forecastVersionId: scenario.forecast.forecastVersionId,
        policyDecisionId: scenario.safetyDecision.policyDecisionId,
        consentVersionId: scenario.consentState.consentVersionId,
      });

      if (!presentationMode) {
        auditLedger.recordEventOnce(EVENT_NAMES.MESSAGE_PREVIEW_OPENED, {
          scenarioId: scenario.scenarioId,
          householdId: scenario.household.customerId,
          forecastVersionId: scenario.forecast.forecastVersionId,
        });
      }
    }
  }, [presentationMode, scenario]);

  const handleReset = () => {
    clearPrototypeState();
    window.location.replace(
      presentationMode
        ? '/?scenario=baseline&presentation=true'
        : '/?scenario=baseline'
    );
  };

  const handleViewForecast = () => {
    if (!scenario) {
      return;
    }

    auditLedger.recordEventOnce(EVENT_NAMES.MESSAGE_LINK_SELECTED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
    });
    auditLedger.recordEventOnce(EVENT_NAMES.FORECAST_VIEWED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
    });

    if (scenario.scenarioId === 'alert_alex_late_summer') {
      auditLedger.recordEventOnce(EVENT_NAMES.FORECAST_REVISED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        forecastVersionId: scenario.forecast.forecastVersionId,
      });
      auditLedger.recordEventOnce(EVENT_NAMES.MATERIAL_CHANGE_ALERT_TRIGGERED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        forecastVersionId: scenario.forecast.forecastVersionId,
        properties: {
          reasons: scenario.forecast.materialChangeReasons ?? [],
        },
      });
    } else if (scenario.scenarioId === 'safety_jordan_winter') {
      auditLedger.recordEventOnce(EVENT_NAMES.RECOMMENDATION_SUPPRESSED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        policyDecisionId: scenario.safetyDecision.policyDecisionId,
        recommendationId: scenario.recommendations.find(
          (recommendation) => recommendation.status === 'suppressed'
        )?.recommendationId,
      });
    } else if (scenario.scenarioId === 'forecast_miss_alex_closed_bill') {
      auditLedger.recordEventOnce(EVENT_NAMES.FORECAST_SURPRISE_RECORDED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
        forecastVersionId: scenario.previousForecast?.forecastVersionId,
        properties: scenario.forecast.forecastMissEvaluation ?? {},
      });
    } else if (scenario.scenarioId === 'tariff_preview_alex') {
      auditLedger.recordEventOnce(EVENT_NAMES.TARIFF_PREVIEW_VIEWED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
      });
      auditLedger.recordEventOnce(
        EVENT_NAMES.PERSONALIZED_TARIFF_PREVIEW_SUPPRESSED,
        {
          scenarioId: scenario.scenarioId,
          householdId: scenario.household.customerId,
          consentVersionId: scenario.consentState.consentVersionId,
        }
      );
    } else if (scenario.scenarioId === 'connected_home_preview_alex') {
      auditLedger.recordEventOnce(EVENT_NAMES.CONNECTED_HOME_PREVIEW_VIEWED, {
        scenarioId: scenario.scenarioId,
        householdId: scenario.household.customerId,
      });
      auditLedger.recordEventOnce(
        EVENT_NAMES.PERSONALIZED_DEVICE_RECOMMENDATION_SUPPRESSED,
        {
          scenarioId: scenario.scenarioId,
          householdId: scenario.household.customerId,
          consentVersionId: scenario.consentState.consentVersionId,
        }
      );
    }

    setMessagePreviewState({
      scenarioId: scenario.scenarioId,
      visible: false,
    });
  };

  if (!scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-center">
            <h1 className="mb-2 text-lg font-semibold text-gray-900">
              Scenario Not Found
            </h1>
            <p className="mb-4 text-gray-600">
              The requested scenario is not available or does not exist.
            </p>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('scenario', 'baseline');
                window.location.href = url.toString();
              }}
              className="rounded-md bg-navy px-4 py-2 text-white transition-colors hover:bg-navy-600"
            >
              Go to Baseline Forecast
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo and Product Name */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy shadow-sm">
                  <span className="text-lg font-bold text-white">E</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-navy">Energy Co</div>
                  <div className="-mt-1 hidden text-xs text-gray-500 sm:block">
                    Your Energy Partner
                  </div>
                </div>
              </div>
              <div className="hidden h-6 w-px bg-gray-300 sm:block" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-navy">
                  Bill Control
                </h1>
                <div className="-mt-1 text-xs text-gray-600">
                  Forecast & Action
                </div>
              </div>
            </div>

            {/* Customer Greeting and Controls */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              {scenario && (
                <div className="hidden items-center space-x-3 sm:flex">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {scenario.household.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {scenario.household.address}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-2">
                {scenario && (
                  <div className="hidden rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 sm:block">
                    {scenario.forecast.dataQualityTier === 'full'
                      ? 'Full Data'
                      : 'Limited Data'}
                  </div>
                )}

                <button
                  className="focus-visible hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 sm:block"
                  aria-label="Help and Support"
                >
                  <HelpCircle size={20} />
                </button>

                <div className="relative hidden sm:block">
                  <button
                    className="focus-visible flex items-center space-x-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Account Menu"
                  >
                    <User size={20} />
                    <ChevronDown size={14} />
                  </button>
                </div>

                <DemoSwitcher
                  currentScenario={searchParams.get('scenario') || 'baseline'}
                  presentationMode={presentationMode}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <SyntheticDataNotice />

        {/* Message-First Entry or Scenario Display */}
        {scenario && showMessagePreviews ? (
          <div className="space-y-6">
            <div className="py-4 text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {scenario.scenarioName}
              </h2>
              <p className="text-gray-600">
                This scenario demonstrates message-first engagement. Choose how
                you&apos;d like to view your forecast.
              </p>
            </div>
            <MessagePreviews
              scenario={scenario}
              onViewForecast={handleViewForecast}
            />
            <div className="text-center">
              <button
                onClick={handleViewForecast}
                className="focus-visible rounded-md bg-navy px-6 py-3 text-white transition-colors hover:bg-navy-600"
              >
                Skip to Forecast Details
              </button>
            </div>
          </div>
        ) : (
          scenario && (
            <div className="space-y-6">
              {!showMessagePreviews && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setMessagePreviewState({
                        scenarioId: scenario.scenarioId,
                        visible: true,
                      })
                    }
                    className="focus-visible text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to message previews
                  </button>
                </div>
              )}
              <ScenarioDisplay scenario={scenario} />
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Data updated: Today at 8:00 AM</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <button className="focus-visible underline hover:text-gray-700">
                How this estimate works
              </button>
              <span className="hidden sm:inline">•</span>
              <button className="focus-visible underline hover:text-gray-700">
                Consent and preferences
              </button>
            </div>

            {scenario && (
              <div className="rounded bg-gray-100 px-2 py-1 text-xs">
                {scenario.forecast.forecastVersionId}
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
            <p>
              © 2026 Energy Co. Bill Control is a free service to help you
              understand and manage your energy costs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
