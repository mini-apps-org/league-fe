import { Navigate, Outlet, useLocation } from 'react-router-dom';

import NextPathRedirect from '@/components/NextPathRedirect';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/hooks/useMe';
import { LOGIN_PATH, ONBOARDING_PATH } from '@/lib/navigate';
import { DEFAULT_NEXT_PATH, peekNextPath } from '@/lib/next-path';
import { needsMemberLink } from '@/types/auth';

function AppSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4" aria-busy="true">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

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

  // league-be lands every completed sign-in on `/`, so that is the only place a stored path
  // can be waiting. Checked with a pure read; the consuming read happens in the component.
  // Deliberately after the link gate: an unlinked user has to finish linking first, and their
  // deep link still survives, because linking also returns them here.
  if (location.pathname === DEFAULT_NEXT_PATH && peekNextPath()) {
    return <NextPathRedirect />;
  }

  return <Outlet />;
}
