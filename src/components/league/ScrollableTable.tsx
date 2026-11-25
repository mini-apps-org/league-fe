import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { LoaderCircle } from '@/lib/icons';

interface ScrollableTableProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  children: ReactNode;
  onLoadMore: () => void;
}

// A cursor-paged list in a box of its own height: scrolling near its bottom loads the page at
// next_cursor. The box does the scrolling in both directions, so shadcn's table container is
// told not to, or the sticky header would stick to that container instead.
export const ScrollableTable = ({
  hasMore,
  isLoadingMore,
  children,
  onLoadMore,
}: ScrollableTableProps) => {
  const { t } = useTranslation();
  const { rootRef, sentinelRef } = useInfiniteScroll({ hasMore, isLoadingMore, onLoadMore });

  return (
    <div
      ref={rootRef}
      className="max-h-[60vh] overflow-auto [&_[data-slot=table-container]]:overflow-visible [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-card"
    >
      {children}
      {isLoadingMore && (
        <p className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          {t('common.loading')}
        </p>
      )}
      <div ref={sentinelRef} className="h-px" aria-hidden />
    </div>
  );
};
