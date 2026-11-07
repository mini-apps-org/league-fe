import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_NEXT_PATH,
  peekNextPath,
  rememberNextPath,
  takeNextPath,
  validateNextPath,
} from './next-path';

describe('validateNextPath', () => {
  it('accepts a rooted same-site path', () => {
    expect(validateNextPath('/')).toBe('/');
    expect(validateNextPath('/matches/1')).toBe('/matches/1');
    expect(validateNextPath('/admin/players')).toBe('/admin/players');
  });

  it('keeps the query and hash', () => {
    expect(validateNextPath('/matches/1?tab=away#m3')).toBe('/matches/1?tab=away#m3');
  });

  // The case a hand-rolled startsWith('/') check lets through: no scheme, starts with a
  // slash, and the browser reads it as protocol-relative.
  it('rejects a protocol-relative URL', () => {
    expect(validateNextPath('//evil.com')).toBeNull();
    expect(validateNextPath('//evil.com/matches/1')).toBeNull();
  });

  it('rejects an absolute URL', () => {
    expect(validateNextPath('https://evil.com')).toBeNull();
    expect(validateNextPath('http://evil.com/matches/1')).toBeNull();
  });

  it('rejects a scheme that is not navigation at all', () => {
    expect(validateNextPath('javascript:alert(1)')).toBeNull();
    expect(validateNextPath('data:text/html,<script>')).toBeNull();
  });

  it('rejects a backslash, which some browsers normalise to a slash', () => {
    expect(validateNextPath('/\\evil.com')).toBeNull();
    expect(validateNextPath('\\\\evil.com')).toBeNull();
  });

  it('rejects a bare relative path', () => {
    expect(validateNextPath('matches/1')).toBeNull();
    expect(validateNextPath('../../etc/passwd')).toBeNull();
  });

  it('normalises dot segments away rather than trusting them', () => {
    expect(validateNextPath('/matches/../admin/players')).toBe('/admin/players');
    expect(validateNextPath('/../..')).toBe('/');
  });

  // Both are gates: landing on either after sign-in would redirect again immediately.
  it('rejects the auth routes, which would bounce the user between gates', () => {
    expect(validateNextPath('/login')).toBeNull();
    expect(validateNextPath('/login?error=cancelled')).toBeNull();
    expect(validateNextPath('/onboarding')).toBeNull();
  });

  it('rejects empty and missing input', () => {
    expect(validateNextPath('')).toBeNull();
    expect(validateNextPath(null)).toBeNull();
    expect(validateNextPath(undefined)).toBeNull();
  });
});

describe('rememberNextPath and takeNextPath', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips a valid path', () => {
    rememberNextPath('/matches/abc');
    expect(takeNextPath()).toBe('/matches/abc');
  });

  it('clears on read, so an abandoned attempt cannot hijack the next sign-in', () => {
    rememberNextPath('/matches/abc');
    expect(takeNextPath()).toBe('/matches/abc');
    expect(takeNextPath()).toBe(DEFAULT_NEXT_PATH);
  });

  it('does not store the default, so nothing to clean up for a plain sign-in', () => {
    rememberNextPath('/');
    expect(peekNextPath()).toBe(false);
  });

  it('refuses to store a hostile path', () => {
    rememberNextPath('//evil.com');
    expect(peekNextPath()).toBe(false);
    expect(takeNextPath()).toBe(DEFAULT_NEXT_PATH);
  });

  // Storage is editable from the console, so the read has to validate too.
  it('validates on read, not only on write', () => {
    sessionStorage.setItem('next-path', 'https://evil.com');
    expect(takeNextPath()).toBe(DEFAULT_NEXT_PATH);
  });

  it('reports whether a usable path is waiting', () => {
    expect(peekNextPath()).toBe(false);
    rememberNextPath('/admin/players');
    expect(peekNextPath()).toBe(true);
  });
});
