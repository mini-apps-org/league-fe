import { http, HttpResponse } from 'msw';

import { API_BASE, ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/types/auth';
import type { ErrorCode } from '@/types/errors';
import type { Permission, Role } from '@/types/league';
import { ROLE } from '@/utils';

export const apiUrl = (path: string): string => {
  return new URL(path, API_BASE).toString();
};

export const LINKED_USER: User = {
  id: 'user-1',
  email: 'captain@example.com',
  name: 'Linh Tran',
  avatarUrl: '',
  playerId: 'player-1',
};

export const UNLINKED_USER: User = { ...LINKED_USER, playerId: null };

export const PLAYER_ROLES: Role[] = [ROLE.PLAYER];
export const PLAYER_PERMISSIONS: Permission[] = ['player.read'];

export const CAPTAIN_ROLES: Role[] = [ROLE.CAPTAIN];
export const CAPTAIN_PERMISSIONS: Permission[] = [
  'player.read',
  'match.create',
  'match.read',
  'match.update',
  'roster.create',
  'roster.read',
  'roster.update',
  'team.read',
];

export const SUPER_ADMIN_ROLES: Role[] = [ROLE.SUPER_ADMIN];
export const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  'division.create',
  'division.delete',
  'division.read',
  'division.update',
  'league.create',
  'league.delete',
  'league.read',
  'league.update',
  'match.create',
  'match.delete',
  'match.read',
  'match.update',
  'player.change_skill_level',
  'player.create',
  'player.delete',
  'player.read',
  'player.update',
  'roster.create',
  'roster.delete',
  'roster.read',
  'roster.update',
  'team.create',
  'team.delete',
  'team.read',
  'team.update',
];

export const meHandler = (
  user: User,
  roles: Role[],
  permissions: Permission[],
): ReturnType<typeof http.get> => {
  return http.get(apiUrl(ENDPOINTS.ME), () => {
    return envelope({ user, roles, permissions });
  });
};

export const envelope = <T>(data: T): HttpResponse<Record<string, unknown>> => {
  return HttpResponse.json({ data });
};

export const apiError = (
  status: number,
  code: ErrorCode,
): HttpResponse<Record<string, unknown>> => {
  return HttpResponse.json({ error: { code, message: `test error ${code}` } }, { status });
};

export const handlers = [
  http.get(apiUrl(ENDPOINTS.ME), () => {
    return envelope({ user: LINKED_USER, roles: PLAYER_ROLES, permissions: PLAYER_PERMISSIONS });
  }),
  http.post(apiUrl(ENDPOINTS.AUTH_LOGOUT), () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
