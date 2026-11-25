// Mirrors league-be's internal/teams DTOs, snake_case as they arrive on the wire.

// league-be's maxBulkTeamIDs: a bulk delete above this is a 400001.
export const MAX_BULK_TEAM_IDS = 100;

export type TeamSortField = 'team_code' | 'name' | 'created_at';
export type TeamSort = TeamSortField | `-${TeamSortField}`;

export type RosterSortField =
  | 'full_name'
  | 'member_id'
  | 'skill_level'
  | 'matches_played'
  | 'matches_won'
  | 'total_points'
  | 'joined_at';
export type RosterSort = RosterSortField | `-${RosterSortField}`;

export interface Team {
  id: string;
  team_code: string;
  name: string;
  captain_player_id: string | null;
  venue_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DivisionTeam {
  division_id: string;
  team_id: string;
  created_at: string;
}

// An active roster row with the player's stats in that division, zero before the first match.
export interface RosterPlayer {
  roster_id: string;
  division_id: string;
  team_id: string;
  player_id: string;
  member_id: string;
  full_name: string;
  skill_level: number;
  is_paid: boolean;
  is_captain: boolean;
  matches_played: number;
  matches_won: number;
  total_points: number;
  joined_at: string;
}

// Always a 200: every requested id lands in exactly one of the two lists.
export interface BulkDeleteTeamsResult {
  deleted_ids: string[];
  failed: BulkDeleteTeamFailure[];
}

export interface BulkDeleteTeamFailure {
  id: string;
  code: number;
  message: string;
}

// Filters are ANDed; an empty one is not sent.
export interface TeamListParams {
  division_id?: string;
  venue_id?: string;
  q?: string;
  sort?: TeamSort;
  limit?: number;
}

export interface RosterListParams {
  division_id: string;
  q?: string;
  sort?: RosterSort;
  limit?: number;
}

export interface CreateTeamInput {
  division_id: string;
  team_code: string;
  name: string;
  venue_id?: string;
}

// A partial update: an absent field is left unchanged, so captain and venue can be changed but
// not cleared.
export interface UpdateTeamInput {
  team_code?: string;
  name?: string;
  captain_player_id?: string;
  venue_id?: string;
}

// One player's place on a team within a division: every /teams-roster write needs all three.
export interface RosterEntryRef {
  teamId: string;
  divisionId: string;
  playerId: string;
}

// division_id absent keeps the player in their current division.
export interface TransferRosterPlayerInput {
  team_id: string;
  division_id?: string;
}
