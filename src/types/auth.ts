import type { Role } from '@/types/league';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: Role;
  playerId?: string | null;
}

export function roleOf(user: User | undefined): Role {
  return user?.role ?? 'PLAYER';
}

// True only when the API has explicitly said this account has claimed no player.
export function needsMemberLink(user: User | undefined): boolean {
  return user !== undefined && user.playerId === null;
}

export interface MeResponse {
  user: User;
}
