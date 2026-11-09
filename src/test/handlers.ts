import { http, HttpResponse } from 'msw';

import { API_BASE, ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/types/auth';
import type { ErrorCode } from '@/types/errors';

export function apiUrl(path: string): string {
  return new URL(path, API_BASE).toString();
}

export const LINKED_USER: User = {
  id: 'user-1',
  email: 'captain@example.com',
  name: 'Linh Tran',
  avatarUrl: '',
  role: 'PLAYER',
  playerId: 'player-1',
};

export const UNLINKED_USER: User = { ...LINKED_USER, playerId: null };

export function envelope<T>(data: T): HttpResponse<Record<string, unknown>> {
  return HttpResponse.json({ session_id: 'test-session', count: null, data });
}

export function apiError(status: number, code: ErrorCode): HttpResponse<Record<string, unknown>> {
  return HttpResponse.json({ error: { code, message: `test error ${code}` } }, { status });
}

export const handlers = [
  http.get(apiUrl(ENDPOINTS.ME), () => {
    return envelope({ user: LINKED_USER });
  }),
  http.post(apiUrl(ENDPOINTS.AUTH_LOGOUT), () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
