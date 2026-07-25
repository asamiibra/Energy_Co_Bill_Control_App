'use client';

import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ScenarioErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  State
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Scenario Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-center">
              <h1 className="mb-2 text-lg font-semibold text-gray-900">
                Bill Control Demo Error
              </h1>
              <p className="mb-4 text-gray-600">
                There was an issue loading the scenario. This is a synthetic
                prototype for demonstration purposes.
              </p>
              <button
                onClick={() => {
                  // Reset to baseline scenario
                  const url = new URL(window.location.href);
                  url.searchParams.set('scenario', 'baseline');
                  window.location.href = url.toString();
                }}
                data-interaction-id="error-boundary-reset"
                className="rounded-md bg-navy px-4 py-2 text-white transition-colors hover:bg-navy-600"
              >
                Reset to Baseline Forecast
              </button>
            </div>
            <div className="mt-6 rounded-md bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                <strong>Note:</strong> All data in this prototype is synthetic
                and for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
