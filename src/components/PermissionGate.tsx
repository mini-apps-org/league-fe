import type { ReactNode } from 'react';

import { useHasPermission } from '@/hooks/usePermissions';
import type { Permission } from '@/types/league';

interface PermissionGateProps {
  required: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGate = ({ required, fallback = null, children }: PermissionGateProps) => {
  const hasPermission = useHasPermission(required);

  if (!hasPermission) {
    return fallback;
  }

  return children;
};
