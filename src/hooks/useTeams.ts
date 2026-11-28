import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { teamQueries } from '@/queries/teams';
import type { ApiPage } from '@/types/api';
import type { RosterListParams, RosterPlayer, Team, TeamListParams } from '@/types/teams';

export const useTeams = (
  params: TeamListParams,
): UseInfiniteQueryResult<InfiniteData<ApiPage<Team>>> => {
  return useInfiniteQuery(teamQueries.list(params));
};

export const useTeam = (teamId: string): UseQueryResult<Team> => {
  return useQuery(teamQueries.detail(teamId));
};

export const useRoster = (
  teamId: string,
  params: RosterListParams,
): UseInfiniteQueryResult<InfiniteData<ApiPage<RosterPlayer>>> => {
  return useInfiniteQuery(teamQueries.roster(teamId, params));
};
