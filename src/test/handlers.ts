import { http } from 'msw';

import { ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/types/auth';
import type { Permission, Role } from '@/types/league';
import { ROLE } from '@/utils';

import { apiUrl, envelope, noContent } from './mocks/http';

export { apiError, apiUrl, envelope } from './mocks/http';

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
  'session.create',
  'session.delete',
  'session.read',
  'session.update',
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

export const handlers = [
  http.get(apiUrl(ENDPOINTS.ME), () => {
    return envelope({ user: LINKED_USER, roles: PLAYER_ROLES, permissions: PLAYER_PERMISSIONS });
  }),
  http.post(apiUrl(ENDPOINTS.AUTH_LOGOUT), () => {
    return noContent();
  }),
];
