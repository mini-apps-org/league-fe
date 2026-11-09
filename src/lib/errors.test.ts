import { describe, expect, it } from 'vitest';

import { ERROR_CODE, LOGIN_ERROR } from '@/types/errors';

import { ApiRequestError, isApiError, parseLoginErrorReason, toApiError } from './errors';

function axiosLike(status: number, body: unknown): unknown {
  return { response: { status, data: body }, config: {} };
}

describe('toApiError', () => {
  it('reads the code and message out of the error envelope', () => {
    const err = toApiError(
      axiosLike(401, { error: { code: '40101', message: 'Your session has expired.' } }),
    );

    expect(err.status).toBe(401);
    expect(err.code).toBe(ERROR_CODE.NO_SESSION);
    expect(err.message).toBe('Your session has expired.');
  });

  // Regression: codes are strings. A code sent as a JSON number is not the contract, so it
  // must degrade rather than being coerced — otherwise a backend regression would pass
  // silently through to an i18n key lookup.
  it('degrades a numeric code to INTERNAL', () => {
    const err = toApiError(axiosLike(401, { error: { code: 40101, message: 'nope' } }));

    expect(err.code).toBe(ERROR_CODE.INTERNAL);
  });

  it('degrades an unmodelled code to INTERNAL', () => {
    const err = toApiError(axiosLike(403, { error: { code: '40399', message: 'nope' } }));

    expect(err.code).toBe(ERROR_CODE.INTERNAL);
  });

  it.each([
    ['no body', undefined],
    ['null body', null],
    ['no error key', {}],
    ['empty error', { error: {} }],
    ['string body', 'Bad Gateway'],
  ])('survives a response with %s', (_label, body) => {
    const err = toApiError(axiosLike(500, body));

    expect(err.code).toBe(ERROR_CODE.INTERNAL);
    expect(err.status).toBe(500);
  });

  it('reports status 0 for a request that got no response', () => {
    const err = toApiError({ request: {}, message: 'Network Error' });

    expect(err.status).toBe(0);
    expect(err.code).toBe(ERROR_CODE.INTERNAL);
  });

  it('passes an ApiRequestError through untouched', () => {
    const original = new ApiRequestError(404, ERROR_CODE.NOT_FOUND, 'gone');

    expect(toApiError(original)).toBe(original);
  });

  it('recognises its own error type', () => {
    expect(isApiError(toApiError(new Error('boom')))).toBe(true);
    expect(isApiError(new Error('boom'))).toBe(false);
  });
});

describe('parseLoginErrorReason', () => {
  it.each(Object.values(LOGIN_ERROR))('accepts the %s slug', (reason) => {
    expect(parseLoginErrorReason(reason)).toBe(reason);
  });

  // An unknown ?error= renders no banner at all rather than an "unknown error" the user
  // cannot act on, so every one of these must be null.
  it.each([
    ['absent', null],
    ['empty', ''],
    ['unmodelled', 'teapot'],
    ['a numeric code', '40102'],
    ['wrong case', 'Cancelled'],
  ])('rejects %s', (_label, value) => {
    expect(parseLoginErrorReason(value)).toBeNull();
  });
});
