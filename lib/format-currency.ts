/**
 * Format a number as USD currency using en-US conventions
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options?: { includeDecimals?: boolean }
): string {
  const { includeDecimals = true } = options || {};

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format a currency range
 * @param low - Lower bound
 * @param high - Upper bound
 * @returns Formatted range string (e.g., "$171–$204")
 */
export function formatCurrencyRange(low: number, high: number): string {
  return `${formatCurrency(low, { includeDecimals: false })}–${formatCurrency(high, { includeDecimals: false })}`;
}
