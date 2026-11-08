import type { ApiEnvelope } from '@/types/api';
import type {
  AvailablePlayer,
  Division,
  IndividualMatch,
  MemberPreview,
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

  // week_no is optional: the schedule fetches the whole list once and derives its chips.
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

  // Each row carries can_put_up plus a machine-readable reason. The client never sums skill
  // levels itself: two captains on two phones make any local list stale.
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

  // The triggers score, so render the response, not the local preview from rules.ts.
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

  // For the admin transfer control; plan 3 specified no endpoint.
  async fetchTeams(divisionId: string): Promise<TeamRef[]> {
    const { data } = await this.get<ApiEnvelope<TeamRef[]>>(ENDPOINTS.TEAMS, {
      division_id: divisionId,
    });

    return data;
  }

  // Read-only, shown before any write, so a mistyped digit cannot claim someone's record.
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

  // 204: the admin screen refetches instead of reading a response, because a skill-level
  // change also moves the race previews beside it.
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
