import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { LeagueAPI } from '@/api/leagueAPI';
import type {
  AvailablePlayer,
  Division,
  Player,
  Season,
  Side,
  SkillLevelChange,
  TeamMatchDetail,
  TeamMatchSummary,
  TeamRef,
} from '@/types/league';

export const SEASONS_KEY = ['seasons'] as const;

export function useSeasons(): UseQueryResult<Season[]> {
  return useQuery({
    queryKey: SEASONS_KEY,
    queryFn: () => {
      return LeagueAPI.fetchSeasons();
    },
  });
}

export function useDivisions(seasonId: string | undefined): UseQueryResult<Division[]> {
  return useQuery({
    queryKey: ['divisions', seasonId],
    queryFn: () => {
      return LeagueAPI.fetchDivisions(seasonId as string);
    },
    enabled: seasonId !== undefined,
  });
}

// The whole division's fixtures in one request; the schedule derives its week chips from
// them and filters client-side.
export function useFixtures(divisionId: string | undefined): UseQueryResult<TeamMatchSummary[]> {
  return useQuery({
    queryKey: ['fixtures', divisionId],
    queryFn: () => {
      return LeagueAPI.fetchFixtures(divisionId as string);
    },
    enabled: divisionId !== undefined,
  });
}

export function useTeamMatch(teamMatchId: string | undefined): UseQueryResult<TeamMatchDetail> {
  return useQuery({
    queryKey: ['team-match', teamMatchId],
    queryFn: () => {
      return LeagueAPI.fetchTeamMatch(teamMatchId as string);
    },
    enabled: teamMatchId !== undefined,
  });
}

// Per-player can_put_up plus a machine-readable reason, straight from the server. The client
// never sums skill levels to decide: another captain may have put someone up since this
// rendered. staleTime 0 so re-entering the screen always refetches.
export function useAvailablePlayers(
  teamMatchId: string | undefined,
  side: Side | undefined,
  matchOrder: number | undefined,
): UseQueryResult<AvailablePlayer[]> {
  return useQuery({
    queryKey: ['available', teamMatchId, side, matchOrder],
    queryFn: () => {
      return LeagueAPI.fetchAvailablePlayers(
        teamMatchId as string,
        side as Side,
        matchOrder as number,
      );
    },
    enabled: teamMatchId !== undefined && side !== undefined && matchOrder !== undefined,
    staleTime: 0,
  });
}

const MIN_SEARCH_LENGTH = 2;

export function usePlayerSearch(query: string): UseQueryResult<Player[]> {
  return useQuery({
    queryKey: ['players', query],
    queryFn: () => {
      return LeagueAPI.searchPlayers(query);
    },
    enabled: query.trim().length >= MIN_SEARCH_LENGTH,
  });
}

export function useSkillLevelHistory(
  playerId: string | undefined,
): UseQueryResult<SkillLevelChange[]> {
  return useQuery({
    queryKey: ['skill-level-history', playerId],
    queryFn: () => {
      return LeagueAPI.fetchSkillLevelHistory(playerId as string);
    },
    enabled: playerId !== undefined,
  });
}

export function useTeams(divisionId: string | undefined): UseQueryResult<TeamRef[]> {
  return useQuery({
    queryKey: ['teams', divisionId],
    queryFn: () => {
      return LeagueAPI.fetchTeams(divisionId as string);
    },
    enabled: divisionId !== undefined,
  });
}
