// The league API contract.
//
// TEMPORARY: the prompt requires these to be generated from league-be's swagger with
// openapi-typescript into src/lib/api.types.ts, and they must not be hand-maintained. Phase 3
// has not written the endpoints yet, so there is nothing to generate from. When it lands,
// generate the types and delete this file — the shapes below are the contract phase 3 is
// expected to emit.
//
// Wire format is camelCase, matching the existing auth.UserResponse json tags, not the
// snake_case of the envelope's own fields.

export type Role = 'admin' | 'captain' | 'player';

export type Side = 'home' | 'away';

export type TeamMatchStatus = 'scheduled' | 'in_progress' | 'submitted';

export type IndividualMatchStatus = 'pending' | 'complete';

// Returned by put_up_block_reason(). Switch on these, never on prose.
export type PutUpBlockReason =
  'would_break_23' | 'already_put_up' | 'not_on_roster' | 'side_complete';

export interface Season {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Division {
  id: string;
  seasonId: string;
  name: string;
  skillLevelCap: number;
}

export interface TeamRef {
  id: string;
  teamNumber: string;
  name: string;
}

export interface VenueRef {
  id: string;
  name: string;
}

export interface TeamMatchSummary {
  id: string;
  weekNo: number;
  scheduledAt: string;
  status: TeamMatchStatus;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  venue: VenueRef | null;
  homePoints: number;
  awayPoints: number;
}

// One row of player_division_stats.
export interface RosterPlayer {
  playerId: string;
  memberId: string;
  fullName: string;
  skillLevel: number;
  isPaid: boolean;
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
}

// Skill levels and races are the snapshot taken at put-up, never the player's live level.
export interface IndividualMatch {
  id: string;
  matchOrder: number;
  firstPutUp: Side;
  status: IndividualMatchStatus;
  homePlayerId: string | null;
  awayPlayerId: string | null;
  homePlayerName: string | null;
  awayPlayerName: string | null;
  homeSkillLevel: number | null;
  awaySkillLevel: number | null;
  homeRace: number | null;
  awayRace: number | null;
  homeGames: number;
  awayGames: number;
  innings: number | null;
  homeDefShots: number;
  awayDefShots: number;
  homePoints: number;
  awayPoints: number;
}

export interface TeamMatchDetail extends TeamMatchSummary {
  divisionId: string;
  skillLevelCap: number;
  submittedAt: string | null;
  homeRoster: RosterPlayer[];
  awayRoster: RosterPlayer[];
  matches: IndividualMatch[];
  // Decided server-side: admin, or the captain of one of these two teams. The UI must not
  // re-derive "captain owns this night" — the backend already knows, and a hidden button is
  // not a permission check.
  viewerCanManage: boolean;
  viewerSide: Side | null;
}

export interface AvailablePlayer {
  playerId: string;
  memberId: string;
  fullName: string;
  skillLevel: number;
  canPutUp: boolean;
  blockReason: PutUpBlockReason | null;
}

export interface PutUpInput {
  matchOrder: number;
  side: Side;
  playerId: string;
}

export interface ResultInput {
  homeGames: number;
  awayGames: number;
  innings: number;
  homeDefShots: number;
  awayDefShots: number;
}

export interface Player {
  id: string;
  memberId: string;
  fullName: string;
  skillLevel: number;
  isPaid: boolean;
  teamId: string | null;
  teamNumber: string | null;
}

export interface SkillLevelChange {
  id: number;
  oldSkillLevel: number;
  newSkillLevel: number;
  reason: string | null;
  changedByName: string | null;
  changedAt: string;
}

// What the server is willing to reveal about a member before it is claimed.
//
// `displayName` rather than `fullName` on purpose: an 8-digit id is guessable and the seeded
// ids are sequential, so how much of a real person's name this exposes is a privacy decision
// that belongs to the server. The UI renders whatever it is handed, so narrowing it later
// changes no frontend code.
export interface MemberPreview {
  playerId: string;
  displayName: string;
  skillLevel: number;
  teamId: string | null;
  teamNumber: string | null;
  teamName: string | null;
  isCaptain: boolean;
  // Claimed by somebody. Combined with linkedToMe it decides whether that is an error or
  // simply where this account already is.
  alreadyLinked: boolean;
  linkedToMe: boolean;
}

export interface SkillLevelInput {
  newSkillLevel: number;
  reason: string;
}
