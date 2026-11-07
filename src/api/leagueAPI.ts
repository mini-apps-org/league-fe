import type { ApiEnvelope } from '@/types/api';
import type {
  AvailablePlayer,
  Division,
  MemberPreview,
  IndividualMatch,
  Player,
  PutUpInput,
  ResultInput,
  Season,
  Side,
  SkillLevelChange,
  SkillLevelInput,
  TeamMatchDetail,
  TeamMatchSummary,
  TeamRef,
} from '@/types/league';
import { BaseAPI } from './baseAPI';
import { ENDPOINTS } from './endpoints';

class BaseLeagueAPI extends BaseAPI {
  async fetchSeasons(): Promise<Season[]> {
    const { data } = await this.get<ApiEnvelope<Season[]>>(ENDPOINTS.SEASONS);

    return data;
  }

  async fetchDivisions(seasonId: string): Promise<Division[]> {
    const { data } = await this.get<ApiEnvelope<Division[]>>(ENDPOINTS.DIVISIONS, {
      season_id: seasonId,
    });

    return data;
  }

  // week_no is optional: the schedule fetches a division's whole fixture list once and
  // derives its week chips from it, rather than guessing how many weeks a season has.
  async fetchFixtures(divisionId: string, weekNo?: number): Promise<TeamMatchSummary[]> {
    const { data } = await this.get<ApiEnvelope<TeamMatchSummary[]>>(ENDPOINTS.TEAM_MATCHES, {
      division_id: divisionId,
      week_no: weekNo,
    });

    return data;
  }

  async fetchTeamMatch(teamMatchId: string): Promise<TeamMatchDetail> {
    const { data } = await this.get<ApiEnvelope<TeamMatchDetail>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}`,
    );

    return data;
  }

  // Each row carries can_put_up and, when false, a machine-readable reason. The client never
  // sums skill levels to decide: two captains on two phones make any local list stale.
  async fetchAvailablePlayers(
    teamMatchId: string,
    side: Side,
    matchOrder: number,
  ): Promise<AvailablePlayer[]> {
    const { data } = await this.get<ApiEnvelope<AvailablePlayer[]>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}/available`,
      { side, match_order: matchOrder },
    );

    return data;
  }

  async putUpPlayer(teamMatchId: string, input: PutUpInput): Promise<IndividualMatch> {
    const { data } = await this.post<ApiEnvelope<IndividualMatch>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}/put-up`,
      { matchOrder: input.matchOrder, side: input.side, playerId: input.playerId },
    );

    return data;
  }

  // The triggers do the scoring, so the response is the authority on points — render it,
  // not the local preview from rules.ts.
  async saveResult(individualMatchId: string, input: ResultInput): Promise<IndividualMatch> {
    const { data } = await this.put<ApiEnvelope<IndividualMatch>>(
      `${ENDPOINTS.INDIVIDUAL_MATCHES}/${individualMatchId}/result`,
      {
        homeGames: input.homeGames,
        awayGames: input.awayGames,
        innings: input.innings,
        homeDefShots: input.homeDefShots,
        awayDefShots: input.awayDefShots,
      },
    );

    return data;
  }

  async submitNight(teamMatchId: string): Promise<TeamMatchDetail> {
    const { data } = await this.post<ApiEnvelope<TeamMatchDetail>>(
      `${ENDPOINTS.TEAM_MATCHES}/${teamMatchId}/submit`,
    );

    return data;
  }

  // Added for the admin transfer control, which plan 3 did not specify an endpoint for.
  async fetchTeams(divisionId: string): Promise<TeamRef[]> {
    const { data } = await this.get<ApiEnvelope<TeamRef[]>>(ENDPOINTS.TEAMS, {
      division_id: divisionId,
    });

    return data;
  }

  // Read-only look-up shown before anything is written, so a mistyped digit surfaces
  // somebody else's details instead of silently claiming their record.
  async fetchMemberPreview(memberId: string): Promise<MemberPreview> {
    const { data } = await this.get<ApiEnvelope<MemberPreview>>(ENDPOINTS.MEMBERS_PREVIEW, {
      member_id: memberId,
    });

    return data;
  }

  async linkMember(memberId: string): Promise<void> {
    await this.post<void>(ENDPOINTS.ME_LINK, { memberId });
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const { data } = await this.get<ApiEnvelope<Player[]>>(ENDPOINTS.PLAYERS, { q: query });

    return data;
  }

  // 204 with no body: the admin screen refetches the player list rather than reading a
  // response, because a skill-level change also moves the race previews beside it.
  async changeSkillLevel(playerId: string, input: SkillLevelInput): Promise<void> {
    await this.post<void>(`${ENDPOINTS.PLAYERS}/${playerId}/skill-level`, {
      newSkillLevel: input.newSkillLevel,
      reason: input.reason,
    });
  }

  async fetchSkillLevelHistory(playerId: string): Promise<SkillLevelChange[]> {
    const { data } = await this.get<ApiEnvelope<SkillLevelChange[]>>(
      `${ENDPOINTS.PLAYERS}/${playerId}/skill-level-history`,
    );

    return data;
  }

  async addRosterPlayer(teamId: string, playerId: string): Promise<void> {
    await this.post<void>(`${ENDPOINTS.TEAMS}/${teamId}/roster`, { playerId });
  }
}

export const LeagueAPI = new BaseLeagueAPI();
