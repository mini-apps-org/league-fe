import { describe, expect, it } from 'vitest';

import { formatDate, formatFixtureDateTime, formatRecord } from './format';

describe('formatRecord', () => {
  it('reads matches won over matches played', () => {
    expect(formatRecord(3, 5)).toBe('3/5');
    expect(formatRecord(0, 0)).toBe('0/0');
  });
});

describe('date formatting', () => {
  it('returns an empty string for an unparseable date', () => {
    expect(formatFixtureDateTime('not a date')).toBe('');
    expect(formatDate('not a date')).toBe('');
  });

  it('formats a valid RFC 3339 date', () => {
    expect(formatFixtureDateTime('2026-11-10T19:30:00+07:00')).not.toBe('');
  });
});
