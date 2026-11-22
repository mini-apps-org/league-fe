import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';

import { StateCard } from '@/components/StateCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasRole } from '@/hooks/useHasRole';
import { useMe } from '@/hooks/useMe';
import { Lock } from '@/lib/icons';
import type { Role } from '@/types/league';
import { ROUTES } from '@/utils';

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
    return (
      <StateCard
        icon={Lock}
        title={t('auth.unauthorized')}
        body={t('auth.unauthorizedBody')}
        action={
          <Button variant="outline" asChild>
            <Link to={ROUTES.HOME}>{t('auth.backToSchedule')}</Link>
          </Button>
        }
      />
    );
  }

  return <Outlet />;
};
