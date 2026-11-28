import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { leagueQueries } from '@/queries/league';
import type {
  AdminTeamMatch,
  AdminTeamMatchDetail,
  Division,
  LeagueSession,
  RosterEntry,
  SessionFilters,
  SessionWeek,
  TeamMatchFilters,
  TeamOption,
  VenueOption,
} from '@/types/league';

export const useSessions = (filters: SessionFilters): UseQueryResult<LeagueSession[]> => {
  return useQuery(leagueQueries.sessions(filters));
};

export const useSession = (sessionId: string): UseQueryResult<LeagueSession> => {
  return useQuery(leagueQueries.session(sessionId));
};

export const useSessionWeeks = (sessionId: string): UseQueryResult<SessionWeek[]> => {
  return useQuery(leagueQueries.sessionWeeks(sessionId));
};

export const useSessionDivisions = (sessionId: string): UseQueryResult<Division[]> => {
  return useQuery(leagueQueries.divisions(sessionId));
};

export const useDivisionTeams = (divisionId: string | undefined): UseQueryResult<TeamOption[]> => {
  return useQuery(leagueQueries.teams(divisionId));
};

export const useTeamRoster = (teamId: string | undefined): UseQueryResult<RosterEntry[]> => {
  return useQuery(leagueQueries.roster(teamId));
};

export const useVenues = (): UseQueryResult<VenueOption[]> => {
  return useQuery(leagueQueries.venues());
};

export const useTeamMatches = (filters: TeamMatchFilters): UseQueryResult<AdminTeamMatch[]> => {
  return useQuery(leagueQueries.teamMatches(filters));
};

export const useAdminTeamMatch = (teamMatchId: string): UseQueryResult<AdminTeamMatchDetail> => {
  return useQuery(leagueQueries.teamMatch(teamMatchId));
};
