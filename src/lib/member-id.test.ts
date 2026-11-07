import { describe, expect, it } from 'vitest';

import {
  isCompleteMemberId,
  isLookupableMemberId,
  MEMBER_ID_LENGTH,
  normalizeMemberId,
} from './member-id';

describe('normalizeMemberId', () => {
  it('keeps a clean id unchanged', () => {
    expect(normalizeMemberId('95007620')).toBe('95007620');
  });

  it('strips spaces people type when reading a number aloud', () => {
    expect(normalizeMemberId(' 9500 7620 ')).toBe('95007620');
  });

  it('strips every non-digit, including separators pasted from a spreadsheet', () => {
    expect(normalizeMemberId('9500-7620')).toBe('95007620');
    expect(normalizeMemberId('95.007.620')).toBe('95007620');
    expect(normalizeMemberId('abc95007620def')).toBe('95007620');
  });

  it('truncates past the expected length rather than sending a long id', () => {
    expect(normalizeMemberId('950076201234')).toHaveLength(MEMBER_ID_LENGTH);
  });

  it('is empty for input with no digits', () => {
    expect(normalizeMemberId('')).toBe('');
    expect(normalizeMemberId('   ')).toBe('');
    expect(normalizeMemberId('not a number')).toBe('');
  });
});

describe('isLookupableMemberId', () => {
  it('rejects anything too short to be worth a request', () => {
    expect(isLookupableMemberId('')).toBe(false);
    expect(isLookupableMemberId('950')).toBe(false);
  });

  it('accepts a partial id, so a league numbering differently still works', () => {
    expect(isLookupableMemberId('9500')).toBe(true);
    expect(isLookupableMemberId('95007620')).toBe(true);
  });
});

describe('isCompleteMemberId', () => {
  it('is true only at the full expected length', () => {
    expect(isCompleteMemberId('95007620')).toBe(true);
    expect(isCompleteMemberId('9500762')).toBe(false);
  });
});
