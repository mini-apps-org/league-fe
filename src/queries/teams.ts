import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { TeamsAPI } from '@/api/teamsAPI';
import { FIRST_PAGE_CURSOR, getNextCursor } from '@/lib/paging';
import type { RosterListParams, TeamListParams } from '@/types/teams';

// Prefixes for invalidation. Filters, sort and page size sit in each list key, so changing any
// of them starts again from page one: a cursor is only valid for the sort that made it.
export const TEAM_KEYS = {
  ALL: ['teams'],
  LISTS: ['teams', 'list'],
  DETAILS: ['teams', 'detail'],
  ROSTERS: ['teams', 'roster'],
} as const;

export const teamQueries = {
  list: (params: TeamListParams) => {
    return infiniteQueryOptions({
      queryKey: [...TEAM_KEYS.LISTS, params],
      queryFn: ({ pageParam }) => {
        return TeamsAPI.fetchTeams(params, pageParam);
      },
      initialPageParam: FIRST_PAGE_CURSOR,
      getNextPageParam: getNextCursor,
    });
  },

  detail: (teamId: string) => {
    return queryOptions({
      queryKey: [...TEAM_KEYS.DETAILS, teamId],
      queryFn: () => {
        return TeamsAPI.fetchTeam(teamId);
      },
    });
  },

  // A team has one roster per division it entered, so the division is part of the key.
  roster: (teamId: string, params: RosterListParams) => {
    return infiniteQueryOptions({
      queryKey: [...TEAM_KEYS.ROSTERS, teamId, params],
      queryFn: ({ pageParam }) => {
        return TeamsAPI.fetchRoster(teamId, params, pageParam);
      },
      initialPageParam: FIRST_PAGE_CURSOR,
      getNextPageParam: getNextCursor,
      enabled: params.division_id !== '',
    });
  },
};
