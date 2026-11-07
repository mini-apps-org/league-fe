import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_NEXT_PATH, takeNextPath } from '@/lib/next-path';

export default function NextPathRedirect() {
  const navigate = useNavigate();
  const hasConsumed = useRef(false);

  useEffect(() => {
    if (hasConsumed.current) {
      return;
    }
    hasConsumed.current = true;

    const target = takeNextPath();

    if (target !== DEFAULT_NEXT_PATH) {
      void navigate(target, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4" aria-busy="true">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
