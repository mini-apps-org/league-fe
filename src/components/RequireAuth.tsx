import { Navigate, Outlet, useLocation } from 'react-router-dom';

import AppSkeleton from '@/components/AppSkeleton';
import { useMe } from '@/hooks/useMe';
import { LOGIN_PATH, ONBOARDING_PATH } from '@/lib/navigate';
import { needsMemberLink } from '@/types/auth';

export default function RequireAuth() {
  const location = useLocation();

  const me = useMe();

  if (me.isPending) {
    return <AppSkeleton />;
  }

  if (me.isError) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />;
  }

  // Signed in but no league player claimed yet. Every write path authorises through
  // players.user_id, so an unlinked user would land in an app where nothing is actionable and
  // nothing explains why. The guard lives here because this component already owns the
  // session check and already holds the /api/v1/me response.
  if (needsMemberLink(me.data?.user) && location.pathname !== ONBOARDING_PATH) {
    return <Navigate to={ONBOARDING_PATH} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
