/**
 * Format an ISO date string to a human-readable format
 * @param isoDate - ISO 8601 date string
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  isoDate: string,
  options?: { format?: 'short' | 'long' | 'medium' }
): string {
  const date = new Date(isoDate);
  const { format = 'medium' } = options || {};

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Format an ISO timestamp to include time
 * @param isoTimestamp - ISO 8601 timestamp string
 * @returns Formatted date and time string
 */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Calculate days between two dates
 * @param startDate - Start date ISO string
 * @param endDate - End date ISO string
 * @returns Number of days between dates (can be fractional)
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return diffTime / (1000 * 60 * 60 * 24);
}
