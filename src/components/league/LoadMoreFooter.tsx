import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoaderCircle } from '@/lib/icons';
import { PAGE_SIZES } from '@/lib/paging';

interface LoadMoreFooterProps {
  summary: string;
  pageSize: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreLabel: string;
  endLabel: string;
  onPageSizeChange: (pageSize: number) => void;
  onLoadMore: () => void;
}

// The cursor-paged lists' footer: "Showing X of Y", a page size, then Load more until the
// server sends no next_cursor.
export const LoadMoreFooter = ({
  summary,
  pageSize,
  hasMore,
  isLoadingMore,
  loadMoreLabel,
  endLabel,
  onPageSizeChange,
  onLoadMore,
}: LoadMoreFooterProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {summary}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {t('teams.paging.perPage')}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger aria-label={t('teams.paging.perPage')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
        {hasMore ? (
          <Button variant="outline" disabled={isLoadingMore} onClick={onLoadMore}>
            {isLoadingMore && <LoaderCircle className="animate-spin" aria-hidden />}
            {isLoadingMore ? t('common.loading') : loadMoreLabel}
          </Button>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">{endLabel}</span>
        )}
      </div>
    </div>
  );
};
