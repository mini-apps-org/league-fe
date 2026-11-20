import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { EmptyState } from '@/components/league/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasRole } from '@/hooks/useHasRole';
import { useMe } from '@/hooks/useMe';
import { TriangleAlert } from '@/lib/icons';
import type { Role } from '@/types/league';

interface RequireRoleProps {
  allowed: Role[];
}

export const RequireRole = ({ allowed }: RequireRoleProps) => {
  const { t } = useTranslation();
  const { isPending } = useMe();
  const hasRole = useHasRole(allowed);

  if (isPending) {
    return <Skeleton className="h-64 w-full rounded-card" />;
  }

  if (!hasRole) {
    return <EmptyState icon={TriangleAlert} title={t('auth.unauthorized')} />;
  }

  return <Outlet />;
};
