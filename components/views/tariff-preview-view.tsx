import { ArrowRight, LockKeyhole } from 'lucide-react';

import { formatCurrencyRange, formatCurrency } from '@/lib/format-currency';
import type { DemoScenario } from '@/domain/scenario';

export function TariffPreviewView({ scenario }: { scenario: DemoScenario }) {
  const preview = scenario.futurePreview;

  if (!preview || preview.kind !== 'tariff') {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="tariff-preview-title">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
        <p className="font-semibold">
          Future expansion preview — not part of the MVP pilot.
        </p>
        <p className="mt-1 text-sm">Not available in the MVP.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2
          id="tariff-preview-title"
          className="text-2xl font-semibold text-navy"
        >
          Tariff-Fit Preview
        </h2>
        <p className="mt-2 text-gray-700">
          A different tariff may lower your estimated annual cost. Review the
          assumptions, contract terms, and trade-offs.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Current tariff</p>
            <p className="font-semibold">{scenario.household.tariffName}</p>
            <p className="mt-2 text-xl font-bold">
              {formatCurrencyRange(
                preview.currentAnnualCostRange.low,
                preview.currentAnnualCostRange.high
              )}
            </p>
            <p className="text-sm text-gray-600">estimated annual cost</p>
          </div>
          <ArrowRight className="mx-auto text-gray-500" aria-hidden="true" />
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Alternative tariff</p>
            <p className="font-semibold">Time-of-Use Flex 12</p>
            <p className="mt-2 text-xl font-bold">
              {formatCurrencyRange(
                preview.alternativeAnnualCostRange.low,
                preview.alternativeAnnualCostRange.high
              )}
            </p>
            <p className="text-sm text-gray-600">estimated annual cost</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-green-50 p-4">
          <p className="text-sm text-gray-700">Potential annual benefit</p>
          <p className="text-xl font-bold text-green-900">
            {formatCurrencyRange(
              preview.potentialAnnualBenefit.low,
              preview.potentialAnnualBenefit.high
            )}
          </p>
          <p className="text-sm text-gray-700">
            Directional estimate, not guaranteed savings.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <strong>{formatCurrency(preview.exitFee)} exit fee</strong>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <strong>{preview.termMonths}-month term</strong>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <strong>Higher peak rates</strong>
          </div>
        </div>

        <details className="mt-6 rounded-lg border p-4">
          <summary className="cursor-pointer font-semibold">
            Assumptions
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {preview.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </details>

        <div className="mt-6 flex items-start gap-3 rounded-lg border p-4">
          <LockKeyhole className="mt-0.5 text-navy" aria-hidden="true" />
          <div>
            <p className="font-semibold">Preview only</p>
            <p className="text-sm text-gray-700">
              No tariff switch is executable. A future service would require
              identity, consent, explicit confirmation, audit, and rollback.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
