import { i18next } from '@/i18n';
import { ERROR_CODE, LOGIN_ERROR } from '@/types/errors';
import type { ErrorCode, LoginErrorReason } from '@/types/errors';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const isApiError = (err: unknown): err is ApiRequestError => {
  return err instanceof ApiRequestError;
};

// A code this client does not model degrades to INTERNAL rather than rendering a missing
// i18n key. Adding a code to league-be without adding copy here is therefore silent —
// add both in the same change.
const KNOWN_CODES: ReadonlySet<string> = new Set(Object.values(ERROR_CODE));

function readErrorBody(body: unknown): { code: ErrorCode | null; message: string | null } {
  const { error } = (body ?? {}) as { error?: unknown };
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };

  return {
    code: typeof code === 'string' && KNOWN_CODES.has(code) ? (code as ErrorCode) : null,
    message: typeof message === 'string' ? message : null,
  };
}

export function toApiError(err: unknown): ApiRequestError {
  if (isApiError(err)) {
    return err;
  }

  const maybeAxios = err as {
    response?: { status?: number; data?: unknown };
    request?: unknown;
    message?: string;
  };

  // `message` is the backend's own text, kept for debugging only. Render messageFor(err) in
  // the UI, never err.message — only the former goes through the active locale.
  if (maybeAxios?.response) {
    const body = readErrorBody(maybeAxios.response.data);
    const code = body.code ?? ERROR_CODE.INTERNAL;

    return new ApiRequestError(
      maybeAxios.response.status ?? 500,
      code,
      body.message ?? String(code),
    );
  }

  // A request that left but got no response: offline, DNS, CORS, timeout.
  if (maybeAxios?.request) {
    return new ApiRequestError(0, ERROR_CODE.INTERNAL, 'Could not reach the server.');
  }

  return new ApiRequestError(0, ERROR_CODE.INTERNAL, maybeAxios?.message ?? 'Unknown error');
}

export const messageFor = (err: unknown): string => {
  const code = isApiError(err) ? err.code : ERROR_CODE.INTERNAL;

  return i18next.t(`apiError.${code}`);
};

const KNOWN_LOGIN_REASONS: ReadonlySet<string> = new Set(Object.values(LOGIN_ERROR));

// `?error=` is untrusted input from the URL, so it is checked against the known set.
// Anything else — empty, misspelt, an unmodelled reason — yields null and the page renders
// no error banner at all, rather than an "unknown error" the user cannot act on.
export const parseLoginErrorReason = (value: string | null): LoginErrorReason | null => {
  if (value === null) {
    return null;
  }

  return KNOWN_LOGIN_REASONS.has(value) ? (value as LoginErrorReason) : null;
};

export const loginErrorMessage = (reason: LoginErrorReason): string => {
  return i18next.t(`loginError.${reason}`);
};
