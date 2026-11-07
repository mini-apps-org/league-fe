// Codes are 5-digit *strings*, not numbers: the first three digits are the HTTP status, the
// last two the case within it. So '40302' is "the second distinct 403". The registry is
// league-be's `internal/platform/handler/error.go` — a code may be added there but never
// reassigned, so this file only ever grows.
//
// They arrive as JSON strings. A code sent as the number 40101 is rejected and degrades to
// INTERNAL, which keeps the wire format unambiguous in one direction only.
export const ERROR_CODE = {
  // 400 — the request itself is malformed. 40002 is retired (was the app-id check);
  // do not reassign it.
  VALIDATION_FAILED: '40001',
  UNPAID_MEMBER: '40003',
  PUT_UP_REJECTED: '40004',
  MEMBER_NOT_FOUND: '40005',
  MEMBER_TAKEN: '40006',
  ACCOUNT_ALREADY_LINKED: '40007',

  // 401 — the caller is not identified. All four are terminal: there is no refresh endpoint.
  NO_SESSION: '40101',
  SESSION_INVALID: '40102',
  NO_USER_IN_CONTEXT: '40103',
  UNAUTHENTICATED: '40104',

  // 403 — identified, but refused. 40303 is retired (was the app-id allow-list);
  // do not reassign it.
  CSRF_COOKIE_MISSING: '40301',
  CSRF_TOKEN_MISMATCH: '40302',
  FORBIDDEN: '40304',

  NOT_FOUND: '40401',
  RATE_LIMITED: '42901',
  INTERNAL: '50001',
  UPSTREAM: '50201',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

// Slugs, not codes: these are the ?error= values on the redirect back to /login. A failed
// navigation carries no JSON body, so it cannot use the code registry.
export const LOGIN_ERROR = {
  CANCELLED: 'cancelled', // user pressed Cancel at Google
  LOGIN_FAILED: 'login_failed', // bad state, bad id_token, expired transaction
  SERVER_ERROR: 'server_error', // our fault
} as const;

export type LoginErrorReason = (typeof LOGIN_ERROR)[keyof typeof LOGIN_ERROR];
