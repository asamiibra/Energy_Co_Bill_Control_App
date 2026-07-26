import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { primaryDemoScenarios, secondaryDemoGroups } from '@/data/demo-catalog';
import { SyntheticDataNotice } from './synthetic-data-notice';

export function DemoLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white">
            E
          </div>
          <div>
            <div className="font-semibold text-navy">Energy Co</div>
            <div className="text-xs text-gray-600">Bill Control</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <ShieldCheck aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">
            Bill Control Interactive Prototype
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-700">
            A synthetic, read-only prototype demonstrating how customers
            anticipate, understand and respond to bill changes.
          </p>
          <div className="mx-auto mt-6 max-w-3xl text-left">
            <SyntheticDataNotice />
          </div>
          <Link
            href="/?scenario=baseline&presentation=true"
            prefetch={false}
            data-interaction-id="demo-start-guided"
            className="focus-visible mt-2 inline-flex min-h-12 items-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-600"
          >
            Start the 90-second guided demo
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className="mt-12" aria-labelledby="primary-demo-title">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
              Primary demo path
            </p>
            <h2 id="primary-demo-title" className="mt-1 text-2xl text-navy">
              Three customer moments in 90 seconds
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {primaryDemoScenarios.map((scenario) => (
              <article
                key={scenario.id}
                className="flex flex-col rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-blue-800">
                  <span>Scenario {scenario.sequence}</span>
                  {scenario.sequence === 1 && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs">
                      Start here
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-xl text-navy">{scenario.name}</h3>
                <p className="mt-3 font-medium text-gray-900">
                  {scenario.question}
                </p>
                <p className="mt-2 text-sm text-gray-700">{scenario.proof}</p>
                <blockquote className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
                  “{scenario.message}”
                </blockquote>
                <Link
                  href={`/?scenario=${scenario.id}&presentation=true`}
                  prefetch={false}
                  data-interaction-id={`demo-primary-${scenario.id}`}
                  className="focus-visible mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-navy px-4 py-2 font-medium text-navy hover:bg-blue-50 lg:mt-auto"
                >
                  {scenario.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mx-auto mt-10 max-w-4xl space-y-3"
          aria-label="Additional demo states"
        >
          {secondaryDemoGroups.map((group) => (
            <details
              key={group.id}
              className="rounded-xl border bg-white shadow-sm"
            >
              <summary
                data-interaction-id={`demo-${group.id}-toggle`}
                className="focus-visible flex min-h-14 cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-navy"
              >
                {group.title}
                <ChevronDown aria-hidden="true" />
              </summary>
              <div className="border-t p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.scenarios.map((scenario) => (
                    <article
                      key={scenario.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <h3 className="font-semibold">{scenario.name}</h3>
                      <p className="mt-1 text-sm text-gray-700">
                        {scenario.question}
                      </p>
                      <Link
                        href={`/?scenario=${scenario.id}&presentation=true`}
                        prefetch={false}
                        data-interaction-id={`demo-secondary-${scenario.id}`}
                        className="focus-visible mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-blue-800 underline"
                      >
                        Open {scenario.name}
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}
