import type { ApiMetadata } from '@/types/api';

// The "Per page" choices of every load-more list. league-be accepts 1–200.
export const PAGE_SIZES = [10, 25, 50] as const;

export const DEFAULT_PAGE_SIZE = 10;

// The first page of a cursor list: serializeParams drops '', so no cursor is sent.
export const FIRST_PAGE_CURSOR = '';

export const parsePageSize = (raw: string | null): number => {
  const size = Number(raw);

  return PAGE_SIZES.some((option) => option === size) ? size : DEFAULT_PAGE_SIZE;
};

export const getNextCursor = (lastPage: { metadata: ApiMetadata }): string | undefined => {
  return lastPage.metadata.next_cursor;
};
