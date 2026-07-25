import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime } from '@/lib/format-date';

describe('fixture date formatting', () => {
  it('renders date-only fixture values in UTC', () => {
    expect(formatDate('2026-08-02T00:00:00.000Z', { format: 'short' })).toBe(
      'Aug 2'
    );
  });

  it('renders timestamp fixture values in UTC', () => {
    expect(formatDateTime('2026-08-21T08:00:00.000Z')).toBe('Aug 21, 8:00 AM');
  });
});
