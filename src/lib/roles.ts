import type { Role } from '@/types/league';

// Highest first, the order league-be's /me resolves a user's main role in.
const ROLE_RANK: readonly Role[] = ['SUPER_ADMIN', 'CAPTAIN', 'PLAYER'];

export const getHighestRole = (roles: readonly Role[]): Role | undefined => {
  return ROLE_RANK.find((role) => roles.includes(role));
};
