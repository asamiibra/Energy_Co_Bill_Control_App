'use client';

import { useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { HelpCircle, User, ChevronDown, X } from 'lucide-react';

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
import { PresentationNavigation } from './presentation-navigation';

type AppShellProps = {
  initialScenarioId?: string;
  initialPresentationMode?: boolean;
  initialScreenshotMode?: boolean;
};

const subscribeToHydration = () => () => {};

function getInitialSearchParams({
  initialScenarioId,
  initialPresentationMode,
  initialScreenshotMode,
}: AppShellProps): URLSearchParams {
  const params = new URLSearchParams();
  if (initialScenarioId) {
    params.set('scenario', initialScenarioId);
  }
  if (initialPresentationMode) {
    params.set('presentation', 'true');
  }
  if (initialScreenshotMode) {
    params.set('screenshot', 'true');
  }
  return params;
}

export function AppShell({
  initialScenarioId,
  initialPresentationMode = false,
  initialScreenshotMode = false,
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
    initialScreenshotMode,
  });
  const activeSearchParams = hydrated ? searchParams : initialSearchParams;
  const scenario = getScenarioFromUrl(activeSearchParams);
  const presentationMode = activeSearchParams.get('presentation') === 'true';
  const screenshotMode = activeSearchParams.get('screenshot') === 'true';
  const [messagePreviewState, setMessagePreviewState] = useState({
    scenarioId: scenario?.scenarioId,
    visible: true,
  });
  const [headerPanel, setHeaderPanel] = useState<'help' | 'account' | null>(
    null
  );
  const [showAccountSummary, setShowAccountSummary] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountPanelRef = useRef<HTMLDivElement>(null);
  const firstAccountItemRef = useRef<HTMLButtonElement>(null);
  const skipScenarioEventForResetRef = useRef<number | null>(null);
  const showMessagePreviews =
    !presentationMode &&
    !screenshotMode &&
    (messagePreviewState.scenarioId === scenario?.scenarioId
      ? messagePreviewState.visible
      : true);

  const clearPrototypeState = useCallback(() => {
    actionIntentService.clearAllPlans();
    auditLedger.clearEvents();
    auditLedger.resetSession();
    resetPrototypeLocalState();
  }, []);

  const closeAccountPanel = useCallback((restoreFocus = true) => {
    setHeaderPanel(null);
    setShowAccountSummary(false);
    if (restoreFocus) {
      requestAnimationFrame(() => accountTriggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!headerPanel) {
      return;
    }

    if (headerPanel === 'account') {
      firstAccountItemRef.current?.focus();
    }
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !accountPanelRef.current?.contains(target) &&
        !accountTriggerRef.current?.contains(target)
      ) {
        if (headerPanel === 'account') {
          closeAccountPanel();
        } else {
          setHeaderPanel(null);
        }
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (headerPanel === 'account') {
          closeAccountPanel();
        } else {
          setHeaderPanel(null);
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeAccountPanel, headerPanel]);

  useEffect(() => {
    const closeForRouteChange = () => {
      setHeaderPanel(null);
      setShowAccountSummary(false);
    };
    window.addEventListener('popstate', closeForRouteChange);
    window.addEventListener('bill-control:route-change', closeForRouteChange);
    return () => {
      window.removeEventListener('popstate', closeForRouteChange);
      window.removeEventListener(
        'bill-control:route-change',
        closeForRouteChange
      );
    };
  }, []);

  useEffect(() => {
    if (!presentationMode || screenshotMode) {
      return;
    }

    const shortcuts: Record<string, ScenarioId> = {
      '1': 'baseline',
      '2': 'alert',
      '3': 'safety',
    };
    let shortcutTimer: ReturnType<typeof setTimeout> | null = null;
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
        if (shortcutTimer) {
          clearTimeout(shortcutTimer);
        }
        shortcutTimer = setTimeout(
          () => navigateToScenario(nextScenario, true),
          50
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (shortcutTimer) {
        clearTimeout(shortcutTimer);
      }
    };
  }, [presentationMode, screenshotMode]);

  useEffect(() => {
    if (scenario) {
      if (skipScenarioEventForResetRef.current === resetVersion) {
        skipScenarioEventForResetRef.current = null;
        auditLedger.clearEvents();
        return;
      }
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
  }, [presentationMode, resetVersion, scenario]);

  const handleReset = () => {
    clearPrototypeState();
    setHeaderPanel(null);
    setShowAccountSummary(false);
    setMessagePreviewState({
      scenarioId: 'baseline_alex_summer',
      visible: false,
    });
    setResetVersion((current) => {
      const nextVersion = current + 1;
      skipScenarioEventForResetRef.current = nextVersion;
      return nextVersion;
    });
    setResetStatus(
      'Demo reset. Baseline Forecast and canonical data have been restored.'
    );
    window.history.pushState(null, '', '/?scenario=baseline&presentation=true');
    window.setTimeout(() => {
      auditLedger.clearEvents();
      resetPrototypeLocalState();
    }, 0);
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
        properties: {
          policySource: 'customer_declared_essential_use',
          suppressionReason: scenario.safetyDecision.reasonCode,
          suppressedRecommendationTitle: scenario.recommendations.find(
            (recommendation) => recommendation.status === 'suppressed'
          )?.title,
          safeAlternatives: scenario.recommendations
            .filter((recommendation) => recommendation.status === 'available')
            .map((recommendation) => recommendation.recommendationId),
        },
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

  const handleBackToMessages = () => {
    if (!scenario) {
      return;
    }

    setMessagePreviewState({
      scenarioId: scenario.scenarioId,
      visible: true,
    });
    auditLedger.recordEvent(EVENT_NAMES.MESSAGE_PREVIEW_OPENED, {
      scenarioId: scenario.scenarioId,
      householdId: scenario.household.customerId,
      forecastVersionId: scenario.forecast.forecastVersionId,
      properties: { source: 'back_to_messages' },
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
              data-interaction-id="error-return-baseline"
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
                  onClick={() => {
                    setShowAccountSummary(false);
                    setHeaderPanel((current) =>
                      current === 'help' ? null : 'help'
                    );
                  }}
                  data-interaction-id="header-help"
                  className="focus-visible rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Help and Support"
                  aria-expanded={headerPanel === 'help'}
                  aria-controls="header-help-panel"
                >
                  <HelpCircle size={20} />
                </button>

                <button
                  ref={accountTriggerRef}
                  onClick={() => {
                    if (headerPanel === 'account') {
                      closeAccountPanel();
                    } else {
                      setShowAccountSummary(false);
                      setHeaderPanel('account');
                    }
                  }}
                  data-interaction-id="header-account-menu"
                  className="focus-visible flex items-center space-x-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Account Menu"
                  aria-haspopup="menu"
                  aria-expanded={headerPanel === 'account'}
                  aria-controls="account-menu"
                >
                  <User size={20} />
                  <ChevronDown size={14} />
                </button>

                <DemoSwitcher
                  key={resetVersion}
                  currentScenario={searchParams.get('scenario') || 'baseline'}
                  presentationMode={presentationMode && !screenshotMode}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
          {headerPanel && (
            <div className="relative z-50 flex justify-end pb-3">
              <div
                ref={accountPanelRef}
                id={
                  headerPanel === 'account'
                    ? 'account-menu'
                    : 'header-help-panel'
                }
                className="w-[min(19rem,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
                role={headerPanel === 'account' ? 'menu' : 'region'}
                aria-label={
                  headerPanel === 'help' ? 'Bill Control help' : 'Account menu'
                }
              >
                {headerPanel === 'help' ? (
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg">Bill Control help</h2>
                      <button
                        onClick={() => setHeaderPanel(null)}
                        data-interaction-id="header-panel-close"
                        className="focus-visible rounded-md p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Close Bill Control help"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </div>
                    <p>
                      <strong>What it does:</strong> explains an illustrative
                      bill forecast and safe next steps.
                    </p>
                    <p>
                      <strong>Expected range:</strong> the lower and upper bill
                      values currently supported by the available evidence.
                    </p>
                    <p>
                      <strong>Data use:</strong> synthetic billing, weather,
                      tariff, and consent fixtures stay inside this prototype.
                    </p>
                    <p>
                      <strong>Support:</strong> advisor preferences can be saved
                      locally; no external request is sent.
                    </p>
                    <p className="rounded bg-gray-100 p-2 text-xs">
                      A synthetic, high-fidelity interactive prototype of the
                      proposed Bill Control MVP.
                    </p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="border-b px-2 pb-3">
                      <div className="font-semibold text-navy">
                        {scenario.household.customerName}
                      </div>
                      <div className="text-gray-600">
                        {scenario.household.address}
                      </div>
                    </div>
                    <div className="space-y-1 py-2">
                      <button
                        ref={firstAccountItemRef}
                        role="menuitem"
                        onClick={() =>
                          setShowAccountSummary((current) => !current)
                        }
                        data-interaction-id="account-summary"
                        className="focus-visible w-full rounded-md px-2 py-2 text-left text-navy hover:bg-gray-50"
                        aria-expanded={showAccountSummary}
                      >
                        Account summary
                      </button>
                      {showAccountSummary && (
                        <div className="mx-2 rounded-md bg-gray-50 p-3 text-gray-700">
                          <p>Current plan: {scenario.household.tariffName}</p>
                          <p className="mt-1">
                            This local summary is illustrative and read-only.
                          </p>
                        </div>
                      )}
                      <button
                        role="menuitem"
                        onClick={() => {
                          closeAccountPanel(false);
                          navigateToScenario('consent', presentationMode);
                        }}
                        data-interaction-id="account-consent-preferences"
                        className="focus-visible w-full rounded-md px-2 py-2 text-left text-navy hover:bg-gray-50"
                      >
                        Consent and preferences
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowAccountSummary(false);
                          setHeaderPanel('help');
                        }}
                        data-interaction-id="account-help-support"
                        className="focus-visible w-full rounded-md px-2 py-2 text-left text-navy hover:bg-gray-50"
                      >
                        Help and support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {presentationMode && !screenshotMode && (
        <PresentationNavigation
          currentScenario={activeSearchParams.get('scenario') || 'baseline'}
          onReset={handleReset}
        />
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <SyntheticDataNotice />
        {resetStatus && (
          <p
            className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-900"
            role="status"
            aria-live="polite"
          >
            {resetStatus}
          </p>
        )}

        {/* Message-First Entry or Scenario Display */}
        <div key={`${scenario.scenarioId}-${resetVersion}`}>
          {scenario && showMessagePreviews ? (
            <div className="space-y-6">
              <div className="py-4 text-center">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  {scenario.scenarioName}
                </h2>
                <p className="text-gray-600">
                  This scenario demonstrates message-first engagement. Choose
                  how you&apos;d like to view your forecast.
                </p>
              </div>
              <MessagePreviews
                scenario={scenario}
                onViewForecast={handleViewForecast}
              />
              <div className="text-center">
                <button
                  onClick={handleViewForecast}
                  data-interaction-id="message-skip-to-forecast"
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
                    {!presentationMode && !screenshotMode ? (
                      <button
                        onClick={handleBackToMessages}
                        data-interaction-id="forecast-back-to-messages"
                        className="focus-visible text-sm text-blue-600 hover:text-blue-800"
                      >
                        ← Back to message preview
                      </button>
                    ) : null}
                  </div>
                )}
                <ScenarioDisplay scenario={scenario} />
                {presentationMode && !screenshotMode && (
                  <details
                    className="rounded-lg border bg-white p-4 text-sm"
                    data-demo-utility
                  >
                    <summary
                      data-interaction-id="presentation-technical-details"
                      className="focus-visible cursor-pointer font-medium text-navy"
                    >
                      Technical details
                    </summary>
                    <dl className="mt-3 grid gap-2 text-gray-700 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium">Forecast version</dt>
                        <dd>{scenario.forecast.forecastVersionId}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Scenario</dt>
                        <dd>{scenario.scenarioName}</dd>
                      </div>
                    </dl>
                  </details>
                )}
              </div>
            )
          )}
        </div>
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
              <button
                onClick={() => setHeaderPanel('help')}
                data-interaction-id="footer-estimate-method"
                className="focus-visible underline hover:text-gray-700"
              >
                How this estimate works
              </button>
              <span className="hidden sm:inline">•</span>
              <button
                onClick={() => navigateToScenario('consent', presentationMode)}
                data-interaction-id="footer-consent-preferences"
                className="focus-visible underline hover:text-gray-700"
              >
                Consent and preferences
              </button>
            </div>
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
