import { Navigate, Outlet, useLocation } from 'react-router';

import { AppSkeleton } from '@/components/AppSkeleton';
import { useMe } from '@/hooks/useMe';
import { needsMemberLink } from '@/types/auth';
import { ROUTES } from '@/utils';

export function RequireAuth() {
  const location = useLocation();

  const me = useMe();

  if (me.isPending) {
    return <AppSkeleton />;
  }

  if (me.isError) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  // Every write authorises through players.user_id, so an unlinked user would land in an app
  // where nothing works and nothing says why. Guarded here, where the /me response already is.
  if (needsMemberLink(me.data?.user) && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
