import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useRef } from 'react';

interface InfiniteScrollOptions {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

interface InfiniteScrollRefs {
  rootRef: RefObject<HTMLDivElement | null>;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

// Asks for the next page this far before the sentinel scrolls into view, so the rows are
// usually there by the time the user reaches the bottom.
const PREFETCH_MARGIN = '0px 0px 200px 0px';

// Calls onLoadMore whenever the sentinel nears the bottom of the scroll root. Pass hasMore
// false after a failed page, or it would retry on every scroll.
export const useInfiniteScroll = ({
  hasMore,
  isLoadingMore,
  onLoadMore,
}: InfiniteScrollOptions): InfiniteScrollRefs => {
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMore = useEffectEvent(onLoadMore);

  useEffect(() => {
    const root = rootRef.current;
    const sentinel = sentinelRef.current;

    if (!hasMore || isLoadingMore || root === null || sentinel === null) {
      return;
    }

    // A new observer reports the sentinel straight away, so a page too short to scroll keeps
    // loading until it fills the box.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { root, rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore]);

  return { rootRef, sentinelRef };
};
