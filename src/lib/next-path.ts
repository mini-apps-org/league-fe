// Where to send someone after sign-in.
//
// Sign-in is a full-page navigation to league-be, which redirects to Google and back, so the
// SPA is destroyed and rebuilt: no React state survives it. The path therefore goes into
// sessionStorage on the way out and is read back on the way in.
//
// Browser storage is untrusted input — anyone can edit it from the console — so validation
// happens on READ, not only on write.

import { LOGIN_PATH, ONBOARDING_PATH } from './navigate';

const STORAGE_KEY = 'next-path';

// Sending someone "back" to an auth route after signing in is never what they asked for, and
// both of these are gates that would immediately redirect again. Refusing them here stops a
// stored value bouncing the user between screens.
const BLOCKED_PATHS: readonly string[] = [LOGIN_PATH, ONBOARDING_PATH];

export const DEFAULT_NEXT_PATH = '/';

// A sentinel origin: anything that resolves away from it is not a same-site relative path.
// Parsing beats string checks here because `//evil.com` passes `startsWith('/')` and a
// browser treats it as protocol-relative — the classic open redirect.
const SENTINEL_ORIGIN = 'http://next-path.invalid';

export function validateNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || raw === '') {
    return null;
  }

  // Must be rooted. Rejects `javascript:…`, `https://…`, and bare relative paths.
  if (!raw.startsWith('/')) {
    return null;
  }

  // Some browsers normalise a backslash to a forward slash, so `/\evil.com` can escape.
  if (raw.includes('\\')) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw, SENTINEL_ORIGIN);
  } catch {
    return null;
  }

  // `//evil.com` resolves to another origin; anything that moved is refused.
  if (parsed.origin !== SENTINEL_ORIGIN) {
    return null;
  }

  if (BLOCKED_PATHS.includes(parsed.pathname)) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function rememberNextPath(raw: string | null | undefined): void {
  const path = validateNextPath(raw);

  if (path === null || path === DEFAULT_NEXT_PATH) {
    return;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    // Private browsing or a full quota. Landing on the default is a worse experience, not a
    // broken one, so there is nothing to recover from here.
  }
}

// Reads and clears. Clearing matters: a leftover path from an abandoned attempt would hijack
// the *next* sign-in and send someone somewhere they never asked to go.
export function takeNextPath(): string {
  let stored: string | null = null;

  try {
    stored = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return DEFAULT_NEXT_PATH;
  }

  return validateNextPath(stored) ?? DEFAULT_NEXT_PATH;
}

export function peekNextPath(): boolean {
  try {
    return validateNextPath(sessionStorage.getItem(STORAGE_KEY)) !== null;
  } catch {
    return false;
  }
}
