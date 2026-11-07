import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import EmptyState from '@/components/league/EmptyState';
import { useIsAdmin } from '@/hooks/useRole';
import { useMe } from '@/hooks/useMe';
import { Skeleton } from '@/components/ui/skeleton';
import { TriangleAlert } from '@/lib/icons';

// Route-level hiding only. league-be refuses the writes independently — this exists so an
// admin screen does not render controls a captain cannot use, not as the permission check.
export default function RequireAdmin() {
  const { t } = useTranslation();
  const { isPending } = useMe();
  const isAdmin = useIsAdmin();

  if (isPending) {
    return <Skeleton className="h-64 w-full rounded-card" />;
  }

  if (!isAdmin) {
    return <EmptyState icon={TriangleAlert} title={t('apiError.40304')} />;
  }

  return <Outlet />;
}
