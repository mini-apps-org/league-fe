import type { ApiEnvelope, ApiPage } from '@/types/api';
import type {
  BulkDeleteTeamsResult,
  CreateTeamInput,
  DivisionTeam,
  RosterEntryKey,
  RosterListParams,
  RosterPlayer,
  Team,
  TeamListParams,
  TransferRosterPlayerInput,
  UpdateTeamInput,
} from '@/types/teams';

import { BaseAPI, withQuery } from './baseAPI';
import { ENDPOINTS } from './endpoints';

// league-be stores team codes upper case and accepts either; normalising here keeps every
// caller's duplicate check and display in step with what the server keeps.
const normaliseTeamCode = (teamCode: string): string => {
  return teamCode.trim().toUpperCase();
};

const rosterPlayerURL = (ref: RosterEntryKey): string => {
  return withQuery(`${ENDPOINTS.TEAMS_ROSTER}/${ref.teamId}/${ref.playerId}`, {
    division_id: ref.divisionId,
  });
};

class BaseTeamsAPI extends BaseAPI {
  // `cursor` is the previous page's metadata.next_cursor, valid only with the same filters
  // and sort; '' asks for the first page.
  async fetchTeams(params: TeamListParams, cursor: string): Promise<ApiPage<Team>> {
    return this.get<ApiPage<Team>>(ENDPOINTS.TEAMS, { ...params, cursor });
  }

  async fetchTeam(teamId: string): Promise<Team> {
    const { data } = await this.get<ApiEnvelope<Team>>(`${ENDPOINTS.TEAMS}/${teamId}`);

    return data;
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const { data } = await this.post<ApiEnvelope<Team>>(ENDPOINTS.TEAMS, {
      ...input,
      team_code: normaliseTeamCode(input.team_code),
    });

    return data;
  }

  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const body =
      input.team_code === undefined
        ? input
        : { ...input, team_code: normaliseTeamCode(input.team_code) };
    const { data } = await this.patch<ApiEnvelope<Team>>(`${ENDPOINTS.TEAMS}/${teamId}`, body);

    return data;
  }

  // 204. Frees the team's players; fixtures and results stay.
  async deleteTeam(teamId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.TEAMS}/${teamId}`);
  }

  // 204. Only after deleteTeam, and only for a team with no matches; otherwise a 409.
  async deleteTeamPermanently(teamId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.TEAMS}/${teamId}/permanent`);
  }

  // Best effort: a 200 even when some ids fail, each failure carrying the single delete's error.
  async bulkDeleteTeams(teamIds: string[]): Promise<BulkDeleteTeamsResult> {
    const { data } = await this.delete<ApiEnvelope<BulkDeleteTeamsResult>>(ENDPOINTS.TEAMS, {
      data: { ids: teamIds },
    });

    return data;
  }

  async bulkDeleteTeamsPermanently(teamIds: string[]): Promise<BulkDeleteTeamsResult> {
    const { data } = await this.delete<ApiEnvelope<BulkDeleteTeamsResult>>(
      ENDPOINTS.TEAMS_PERMANENT,
      { data: { ids: teamIds } },
    );

    return data;
  }

  async addTeamDivision(teamId: string, divisionId: string): Promise<DivisionTeam> {
    const { data } = await this.post<ApiEnvelope<DivisionTeam>>(
      `${ENDPOINTS.TEAMS}/${teamId}/divisions`,
      { division_id: divisionId },
    );

    return data;
  }

  // 204. A 409 while the team has matches in that division.
  async removeTeamDivision(teamId: string, divisionId: string): Promise<void> {
    await this.delete<void>(`${ENDPOINTS.TEAMS}/${teamId}/divisions/${divisionId}`);
  }

  async fetchRoster(
    teamId: string,
    params: RosterListParams,
    cursor: string,
  ): Promise<ApiPage<RosterPlayer>> {
    return this.get<ApiPage<RosterPlayer>>(`${ENDPOINTS.TEAMS_ROSTER}/${teamId}`, {
      ...params,
      cursor,
    });
  }

  async addRosterPlayer(ref: RosterEntryKey): Promise<RosterPlayer> {
    const url = withQuery(`${ENDPOINTS.TEAMS_ROSTER}/${ref.teamId}`, {
      division_id: ref.divisionId,
    });
    const { data } = await this.post<ApiEnvelope<RosterPlayer>>(url, { player_id: ref.playerId });

    return data;
  }

  // Closes the player's entry and opens one on the target team in one transaction. The
  // captain cannot be transferred (409).
  async transferRosterPlayer(
    ref: RosterEntryKey,
    input: TransferRosterPlayerInput,
  ): Promise<RosterPlayer> {
    const { data } = await this.patch<ApiEnvelope<RosterPlayer>>(rosterPlayerURL(ref), input);

    return data;
  }

  // 204. The captain cannot be removed (409).
  async removeRosterPlayer(ref: RosterEntryKey): Promise<void> {
    await this.delete<void>(rosterPlayerURL(ref));
  }
}

export const TeamsAPI = new BaseTeamsAPI();
