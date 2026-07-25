'use client';

import { formatCurrency, formatCurrencyRange } from '@/lib/format-currency';

interface ForecastRangeVisualizationProps {
  expectedBill: number;
  range: { low: number; high: number };
  className?: string;
}

export function ForecastRangeVisualization({
  expectedBill,
  range,
  className = '',
}: ForecastRangeVisualizationProps) {
  const rangeWidth = range.high - range.low;
  const pointPosition = ((expectedBill - range.low) / rangeWidth) * 100;

  // Ensure the point is within visible bounds
  const clampedPosition = Math.max(5, Math.min(95, pointPosition));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main forecast amount */}
      <div className="text-2xl font-bold text-gray-900">
        {formatCurrency(expectedBill, { includeDecimals: false })}
      </div>

      {/* Range visualization */}
      <div className="space-y-2">
        <div
          className="forecast-range-bar"
          role="img"
          aria-label={`Expected bill range from ${formatCurrency(range.low)} to ${formatCurrency(range.high)}, with most likely amount of ${formatCurrency(expectedBill)}`}
        >
          <div className="forecast-range-fill" />
          <div
            className="forecast-point-marker"
            style={{ left: `${clampedPosition}%` }}
            title={`Most likely: ${formatCurrency(expectedBill)}`}
          />
        </div>

        {/* Range labels */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            <span className="font-medium">${range.low}</span>
            <div className="text-xs text-gray-500">Low estimate</div>
          </div>
          <div className="text-center">
            <span className="font-medium text-navy">Most likely</span>
            <div className="text-xs text-gray-500">
              {formatCurrency(expectedBill, { includeDecimals: false })}
            </div>
          </div>
          <div className="text-right text-gray-600">
            <span className="font-medium">${range.high}</span>
            <div className="text-xs text-gray-500">High estimate</div>
          </div>
        </div>
      </div>

      {/* Range summary */}
      <div className="text-sm text-gray-600">
        <p className="mb-1">
          <strong>Expected range:</strong>{' '}
          {formatCurrencyRange(range.low, range.high)}
        </p>
        <p className="text-xs text-gray-500">
          Your actual bill may fall outside this range. The range reflects
          current data quality and billing period remaining.
        </p>
      </div>
    </div>
  );
}
