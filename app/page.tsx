'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell';
import { ScenarioErrorBoundary } from '@/components/scenario-error-boundary';

export default function HomePage() {
  return (
    <ScenarioErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <AppShell />
      </Suspense>
    </ScenarioErrorBoundary>
  );
}
