const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

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
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  if (format === 'short') {
    return `${SHORT_MONTHS[monthIndex]} ${day}`;
  }

  if (format === 'long') {
    return `${LONG_MONTHS[monthIndex]} ${day}, ${year}`;
  }

  return `${SHORT_MONTHS[monthIndex]} ${day}, ${year}`;
}

/**
 * Format an ISO timestamp to include time
 * @param isoTimestamp - ISO 8601 timestamp string
 * @returns Formatted date and time string
 */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${displayHour}:${minutes} ${period}`;
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
