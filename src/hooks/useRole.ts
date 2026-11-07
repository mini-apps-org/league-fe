import { roleOf } from '@/types/auth';
import type { Role } from '@/types/league';
import { useMe } from './useMe';

// Role comes from the /api/v1/me payload, which is also the session check, so this needs no
// request of its own.
export function useRole(): Role {
  const { data } = useMe();

  return roleOf(data?.user);
}

export function useIsAdmin(): boolean {
  return useRole() === 'ADMIN';
}
