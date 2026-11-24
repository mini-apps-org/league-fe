import { HttpResponse } from 'msw';

import { API_BASE } from '@/api/endpoints';
import { ERROR_CODE, type ErrorCode } from '@/types/errors';

export interface EnvelopeInit {
  status?: number;
  count?: number;
}

export const apiUrl = (path: string): string => {
  return new URL(path, API_BASE).toString();
};

export const envelope = <T>(
  data: T,
  init: EnvelopeInit = {},
): HttpResponse<Record<string, unknown>> => {
  return HttpResponse.json(
    { session_id: 'test-session', count: init.count ?? null, data },
    { status: init.status ?? 200 },
  );
};

// league-be sets count to the total on lists.
export const listEnvelope = <T>(items: T[]): HttpResponse<Record<string, unknown>> => {
  return envelope(items, { count: items.length });
};

export const noContent = (): HttpResponse<null> => {
  return new HttpResponse(null, { status: 204 });
};

export const apiError = (
  status: number,
  code: ErrorCode,
): HttpResponse<Record<string, unknown>> => {
  return HttpResponse.json({ error: { code, message: `test error ${code}` } }, { status });
};

export const validationFailed = (): HttpResponse<Record<string, unknown>> => {
  return apiError(400, ERROR_CODE.VALIDATION_FAILED);
};

export const notFound = (): HttpResponse<Record<string, unknown>> => {
  return apiError(404, ERROR_CODE.NOT_FOUND);
};

// league-be's DecodeJSON answers a body that is not one JSON object with 400001, so the mock
// treats an unparsable body the same as an invalid one.
export const readJsonBody = async (request: Request): Promise<unknown> => {
  try {
    const body: unknown = await request.json();

    return body;
  } catch {
    return undefined;
  }
};
