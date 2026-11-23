// 6-digit *numbers*: status + case within it, so 403002 is the second distinct 403. Mirrors
// league-be's handler/error.go, where codes are added but never reassigned. A code sent as a
// string degrades to INTERNAL, keeping the wire format unambiguous.
export const ERROR_CODE = {
  // 400 — malformed request. 400003–400007 are league codes league-be has not allocated yet;
  // keep them in step when it does.
  VALIDATION_FAILED: 400001,
  UNPAID_MEMBER: 400003,
  PUT_UP_REJECTED: 400004,
  MEMBER_NOT_FOUND: 400005,
  MEMBER_TAKEN: 400006,
  ACCOUNT_ALREADY_LINKED: 400007,

  // 401 — unidentified. All terminal: there is no refresh endpoint.
  NO_SESSION: 401001,
  SESSION_INVALID: 401002,
  NO_USER_IN_CONTEXT: 401003,

  // 403 — identified but refused. The CSRF pair means "reload the page".
  CSRF_COOKIE_MISSING: 403001,
  CSRF_TOKEN_MISMATCH: 403002,
  PERMISSION_DENIED: 403005,

  NOT_FOUND: 404001,
  CONFLICT: 409001,
  INTERNAL: 500001,
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
