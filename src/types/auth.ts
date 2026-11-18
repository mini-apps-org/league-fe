import type { Permission, Role } from '@/types/league';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  playerId?: string | null;
}

export const rolesOf = (me: MeResponse | undefined): Role[] => {
  return me?.roles ?? [];
};

export const permissionsOf = (me: MeResponse | undefined): Permission[] => {
  return me?.permissions ?? [];
};

export const needsMemberLink = (user: User | undefined): boolean => {
  return user !== undefined && user.playerId === null;
};

export interface MeResponse {
  user: User;
  roles: Role[];
  permissions: Permission[];
}
