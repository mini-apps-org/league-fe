import { intersection, isEmpty } from 'lodash-es';

import type { Role } from '@/types/league';

import { useRoles } from './useRole';

export const useHasRole = (allowed: Role[]): boolean => {
  const roles = useRoles();

  return !isEmpty(intersection(roles, allowed));
};
