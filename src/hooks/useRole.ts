import { rolesOf } from '@/types/auth';
import type { Role } from '@/types/league';
import { ROLE } from '@/utils';

import { useMe } from './useMe';

export const useRoles = (): Role[] => {
  const { data } = useMe();

  return rolesOf(data);
};

export const useIsSuperAdmin = (): boolean => {
  return useRoles().includes(ROLE.SUPER_ADMIN);
};
