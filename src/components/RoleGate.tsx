import type { ReactNode } from 'react';

import { useHasRole } from '@/hooks/useHasRole';
import type { Role } from '@/types/league';

interface RoleGateProps {
  allowed: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RoleGate = ({ allowed, fallback = null, children }: RoleGateProps) => {
  const hasRole = useHasRole(allowed);

  if (!hasRole) {
    return fallback;
  }

  return children;
};
