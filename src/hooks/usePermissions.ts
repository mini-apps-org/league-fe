import { permissionsOf } from '@/types/auth';
import type { Permission } from '@/types/league';

import { useMe } from './useMe';

export const useHasPermission = (required: Permission): boolean => {
  const { data } = useMe();
  const permissions = permissionsOf(data);

  return permissions.includes(required);
};
