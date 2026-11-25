import { useSearchParams } from 'react-router';

import { parsePageSize } from '@/lib/paging';
import type { TeamListParams, TeamSort } from '@/types/teams';

export const TEAM_SORTS = [
  'team_code',
  '-team_code',
  'name',
  '-name',
  '-created_at',
  'created_at',
] as const satisfies TeamSort[];

const DEFAULT_TEAM_SORT: TeamSort = 'team_code';

export type TeamFilterName = 'q' | 'division_id' | 'venue_id' | 'sort' | 'limit';

export interface TeamFilters {
  params: Required<TeamListParams>;
  // A search or filter narrows the list, so an empty result means "no matches", not "no teams".
  hasFilters: boolean;
  setFilter: (name: TeamFilterName, value: string) => void;
  clearFilters: () => void;
}

const parseTeamSort = (raw: string | null): TeamSort => {
  return TEAM_SORTS.find((sort) => sort === raw) ?? DEFAULT_TEAM_SORT;
};

// The Teams list's filters live in the URL, so back, refresh and a shared link keep them.
export const useTeamFilters = (): TeamFilters => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: Required<TeamListParams> = {
    q: searchParams.get('q') ?? '',
    division_id: searchParams.get('division_id') ?? '',
    venue_id: searchParams.get('venue_id') ?? '',
    sort: parseTeamSort(searchParams.get('sort')),
    limit: parsePageSize(searchParams.get('limit')),
  };

  const setFilter = (name: TeamFilterName, value: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        if (value === '') {
          next.delete(name);
        } else {
          next.set(name, value);
        }

        return next;
      },
      { replace: true },
    );
  };

  const clearFilters = () => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('q');
        next.delete('division_id');
        next.delete('venue_id');

        return next;
      },
      { replace: true },
    );
  };

  return {
    params,
    hasFilters: params.q !== '' || params.division_id !== '' || params.venue_id !== '',
    setFilter,
    clearFilters,
  };
};
