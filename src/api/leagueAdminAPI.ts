import type { ApiEnvelope } from '@/types/api';
import type {
  AdminTeamMatch,
  AdminTeamMatchDetail,
  Division,
  IndividualMatch,
  IndividualMatchPatch,
  LeagueSession,
  RosterEntry,
  SessionFilters,
  SessionInput,
  SessionPatch,
  SessionWeek,
  TeamMatchFilters,
  TeamMatchInput,
  TeamMatchPatch,
  VenueRef,
} from '@/types/league';
import type { LeagueSessionWeekWire, LeagueSessionWire } from '@/types/league-wire';

import { BaseAPI } from './baseAPI';
import { ENDPOINTS } from './endpoints';
import { toLeagueSession, toLeagueSessionBody, toSessionWeek } from './league-session-mappers';

// Super-admin management of sessions, team matches and individual matches. Bodies are spelled
// out field by field so a form object with extra keys can't leak into a request: league-be
// rejects unknown fields with 400001. Sessions are snake_case on the wire, so they go through
// league-session-mappers.ts.
class BaseLeagueAdminAPI extends BaseAPI {
  async fetchSessions(filters: SessionFilters): Promise<LeagueSession[]> {
    const { data } = await this.get<ApiEnvelope<LeagueSessionWire[]>>(ENDPOINTS.SESSIONS, {
      q: filters.q,
      session_type: filters.sessionType,
      season_year: filters.seasonYear,
      status: filters.status,
      sort: filters.sort,
    });

    return data.map(toLeagueSession);
  }

  async fetchSession(sessionId: string): Promise<LeagueSession> {
    const { data } = await this.get<ApiEnvelope<LeagueSessionWire>>(
      `${ENDPOINTS.SESSIONS}/${sessionId}`,
    );

    return toLeagueSession(data);
  }

  async createSession(input: SessionInput): Promise<LeagueSession> {
    const { data } = await this.post<ApiEnvelope<LeagueSessionWire>>(
      ENDPOINTS.SESSIONS,
      toLeagueSessionBody(input),
    );

    return toLeagueSession(data);
  }

  async updateSession(sessionId: string, patch: SessionPatch): Promise<LeagueSession> {
    const { data } = await this.patch<ApiEnvelope<LeagueSessionWire>>(
      `${ENDPOINTS.SESSIONS}/${sessionId}`,
      toLeagueSessionBody(patch),
    );

    return toLeagueSession(data);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.SESSIONS}/${sessionId}`);
  }

  async fetchSessionWeeks(sessionId: string): Promise<SessionWeek[]> {
    const { data } = await this.get<ApiEnvelope<LeagueSessionWeekWire[]>>(
      `${ENDPOINTS.SESSIONS}/${sessionId}/weeks`,
    );

    return data.map(toSessionWeek);
  }

  async fetchSessionDivisions(sessionId: string): Promise<Division[]> {
    const { data } = await this.get<ApiEnvelope<Division[]>>(ENDPOINTS.DIVISIONS, {
      session_id: sessionId,
    });

    return data;
  }

  async fetchRoster(teamId: string): Promise<RosterEntry[]> {
    const { data } = await this.get<ApiEnvelope<RosterEntry[]>>(
      `${ENDPOINTS.TEAMS}/${teamId}/roster`,
    );

    return data;
  }

  async fetchVenues(): Promise<VenueRef[]> {
    const { data } = await this.get<ApiEnvelope<VenueRef[]>>(ENDPOINTS.VENUES);

    return data;
  }

  async fetchTeamMatches(filters: TeamMatchFilters): Promise<AdminTeamMatch[]> {
    const { data } = await this.get<ApiEnvelope<AdminTeamMatch[]>>(ENDPOINTS.TEAM_MATCHES, {
      session_id: filters.sessionId,
      week_no: filters.weekNo,
      division_id: filters.divisionId,
      team_id: filters.teamId,
      status: filters.status,
      sort: filters.sort,
    });

    return data;
  }

  async fetchTeamMatch(teamMatchId: string): Promise<AdminTeamMatchDetail> {
    const { data } = await this.get<ApiEnvelope<AdminTeamMatchDetail>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}`,
    );

    return data;
  }

  async createTeamMatch(input: TeamMatchInput): Promise<AdminTeamMatchDetail> {
    const { data } = await this.post<ApiEnvelope<AdminTeamMatchDetail>>(ENDPOINTS.TEAM_MATCHES, {
      divisionId: input.divisionId,
      weekNo: input.weekNo,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      venueId: input.venueId,
      scheduledAt: input.scheduledAt,
    });

    return data;
  }

  async updateTeamMatch(teamMatchId: string, patch: TeamMatchPatch): Promise<AdminTeamMatchDetail> {
    const { data } = await this.patch<ApiEnvelope<AdminTeamMatchDetail>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}`,
      {
        weekNo: patch.weekNo,
        homeTeamId: patch.homeTeamId,
        awayTeamId: patch.awayTeamId,
        venueId: patch.venueId,
        scheduledAt: patch.scheduledAt,
        status: patch.status,
      },
    );

    return data;
  }

  async deleteTeamMatch(teamMatchId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}`);
  }

  // Render the response, not the input: the server snapshots skill levels and races and
  // computes the points.
  async updateIndividualMatch(
    individualMatchId: string,
    patch: IndividualMatchPatch,
  ): Promise<IndividualMatch> {
    const { data } = await this.patch<ApiEnvelope<IndividualMatch>>(
      `${ENDPOINTS.INDIVIDUAL_MATCHES}/${individualMatchId}`,
      {
        homePlayerId: patch.homePlayerId,
        awayPlayerId: patch.awayPlayerId,
        homeGames: patch.homeGames,
        awayGames: patch.awayGames,
        innings: patch.innings,
        homeDefShots: patch.homeDefShots,
        awayDefShots: patch.awayDefShots,
        status: patch.status,
      },
    );

    return data;
  }

  // DELETE resets the row to pending rather than removing it: a night always has five.
  async resetIndividualMatch(individualMatchId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.INDIVIDUAL_MATCHES}/${individualMatchId}`);
  }
}

export const LeagueAdminAPI = new BaseLeagueAdminAPI();
