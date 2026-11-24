import { useSearchParams } from 'react-router';

import { parseSessionFilters, writeSessionFilters } from '@/lib/session-filters';
import type { SessionFilters } from '@/types/league';

export interface SessionFiltersState {
  filters: SessionFilters;
  updateFilters: (changes: Partial<SessionFilters>) => void;
  clearFilters: () => void;
}

// The URL is the source of truth, so a filtered list can be shared and survives Back.
export const useSessionFilters = (): SessionFiltersState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters = (changes: Partial<SessionFilters>): void => {
    setSearchParams(
      (current) => {
        return writeSessionFilters(current, changes);
      },
      { replace: true },
    );
  };

  const clearFilters = (): void => {
    updateFilters({
      q: undefined,
      sessionType: undefined,
      seasonYear: undefined,
      status: undefined,
    });
  };

  return { filters: parseSessionFilters(searchParams), updateFilters, clearFilters };
};
