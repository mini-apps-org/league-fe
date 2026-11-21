import { queryOptions, skipToken } from '@tanstack/react-query';

import { LeagueAdminAPI } from '@/api/leagueAdminAPI';
import { LeagueAPI } from '@/api/leagueAPI';
import type { SessionFilters, TeamMatchFilters } from '@/types/league';

// Keys nest so one prefix invalidates a whole family: every filtered list, or a session's
// detail together with its weeks and divisions.
export const leagueQueries = {
  allSessions: () => {
    return ['sessions'] as const;
  },

  sessionLists: () => {
    return [...leagueQueries.allSessions(), 'list'] as const;
  },

  sessions: (filters: SessionFilters) => {
    return queryOptions({
      queryKey: [...leagueQueries.sessionLists(), filters],
      queryFn: () => {
        return LeagueAdminAPI.fetchSessions(filters);
      },
    });
  },

  sessionDetail: (sessionId: string) => {
    return [...leagueQueries.allSessions(), 'detail', sessionId] as const;
  },

  session: (sessionId: string) => {
    return queryOptions({
      queryKey: leagueQueries.sessionDetail(sessionId),
      queryFn: () => {
        return LeagueAdminAPI.fetchSession(sessionId);
      },
    });
  },

  sessionWeeks: (sessionId: string) => {
    return queryOptions({
      queryKey: [...leagueQueries.sessionDetail(sessionId), 'weeks'],
      queryFn: () => {
        return LeagueAdminAPI.fetchSessionWeeks(sessionId);
      },
    });
  },

  divisions: (sessionId: string) => {
    return queryOptions({
      queryKey: [...leagueQueries.sessionDetail(sessionId), 'divisions'],
      queryFn: () => {
        return LeagueAdminAPI.fetchSessionDivisions(sessionId);
      },
    });
  },

  // Undefined until a division is picked in the match form.
  teams: (divisionId: string | undefined) => {
    return queryOptions({
      queryKey: ['divisions', divisionId, 'teams'],
      queryFn:
        divisionId === undefined
          ? skipToken
          : () => {
              return LeagueAPI.fetchTeams(divisionId);
            },
    });
  },

  roster: (teamId: string | undefined) => {
    return queryOptions({
      queryKey: ['teams', teamId, 'roster'],
      queryFn:
        teamId === undefined
          ? skipToken
          : () => {
              return LeagueAdminAPI.fetchRoster(teamId);
            },
    });
  },

  venues: () => {
    return queryOptions({
      queryKey: ['venues'],
      queryFn: () => {
        return LeagueAdminAPI.fetchVenues();
      },
    });
  },

  allTeamMatches: () => {
    return ['team-matches'] as const;
  },

  teamMatchLists: () => {
    return [...leagueQueries.allTeamMatches(), 'list'] as const;
  },

  teamMatches: (filters: TeamMatchFilters) => {
    return queryOptions({
      queryKey: [...leagueQueries.teamMatchLists(), filters],
      queryFn: () => {
        return LeagueAdminAPI.fetchTeamMatches(filters);
      },
    });
  },

  teamMatch: (teamMatchId: string) => {
    return queryOptions({
      queryKey: [...leagueQueries.allTeamMatches(), 'detail', teamMatchId],
      queryFn: () => {
        return LeagueAdminAPI.fetchTeamMatch(teamMatchId);
      },
    });
  },
};
