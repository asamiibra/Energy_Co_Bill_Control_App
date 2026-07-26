import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell';
import { ScenarioErrorBoundary } from '@/components/scenario-error-boundary';

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const scenarioParam = resolvedSearchParams.scenario;
  const presentationParam = resolvedSearchParams.presentation;
  const screenshotParam = resolvedSearchParams.screenshot;
  const initialScenarioId = Array.isArray(scenarioParam)
    ? scenarioParam[0]
    : scenarioParam;
  const initialPresentationMode =
    (Array.isArray(presentationParam)
      ? presentationParam[0]
      : presentationParam) === 'true';
  const initialScreenshotMode =
    (Array.isArray(screenshotParam) ? screenshotParam[0] : screenshotParam) ===
    'true';

  return (
    <ScenarioErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <AppShell
          initialScenarioId={initialScenarioId}
          initialPresentationMode={initialPresentationMode}
          initialScreenshotMode={initialScreenshotMode}
        />
      </Suspense>
    </ScenarioErrorBoundary>
  );
}
