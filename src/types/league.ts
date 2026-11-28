// TEMPORARY: generate these from league-be's swagger with openapi-typescript once phase 3
// ships the endpoints, then delete this file. Do not hand-maintain it beyond that point.
// Payload fields are camelCase; only the envelope's own fields are snake_case.

// Uppercase to match league-be's UserRole constants, so no translation step is needed.
export type Role = 'SUPER_ADMIN' | 'CAPTAIN' | 'PLAYER';

// String alias for now. Tighten to a literal union when openapi-typescript generates types.
export type Permission = string;

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

export interface TeamOption {
  id: string;
  teamNumber: string;
  name: string;
}

export interface VenueOption {
  id: string;
  name: string;
}

export interface TeamMatchSummary {
  id: string;
  weekNo: number;
  scheduledAt: string;
  status: TeamMatchStatus;
  homeTeam: TeamOption;
  awayTeam: TeamOption;
  venue: VenueOption | null;
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

export type SessionType = 'SPRING' | 'SUMMER' | 'FALL';

// Uppercase, unlike the match statuses: league-be's league_sessions CHECK uses these spellings.
export type SessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

export type SessionSort =
  'name' | '-name' | 'starts_on' | '-starts_on' | 'season_year' | '-season_year';

export type TeamMatchSort = 'week_no' | '-week_no' | 'scheduled_at' | '-scheduled_at';

export interface LeagueSession {
  id: string;
  leagueId: string;
  name: string;
  sessionType: SessionType;
  seasonYear: number;
  // ISO dates (YYYY-MM-DD): DATE columns, no time or zone.
  startsOn: string;
  endsOn: string;
  status: SessionStatus;
  isActive: boolean;
  // Derived by the server: distinct week_no across the session's team matches.
  weekCount: number;
  hasSubmittedResults: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInput {
  name: string;
  sessionType: SessionType;
  seasonYear: number;
  startsOn: string;
  endsOn: string;
  status?: SessionStatus;
  isActive?: boolean;
}

export type SessionPatch = Partial<SessionInput>;

export interface SessionFilters {
  q?: string;
  sessionType?: SessionType;
  seasonYear?: number;
  status?: SessionStatus;
  sort?: SessionSort;
}

// A week is not a table: it is the distinct team_matches.week_no values across the session.
export interface SessionWeek {
  weekNo: number;
  matchCount: number;
  submittedCount: number;
  firstScheduledAt: string;
}

export interface DivisionSummary {
  id: string;
  name: string;
}

export interface AdminTeamMatch extends TeamMatchSummary {
  sessionId: string;
  division: DivisionSummary;
}

// Always five rows, ordered by matchOrder: the server creates them with the team match.
export interface AdminTeamMatchDetail extends AdminTeamMatch {
  individualMatches: IndividualMatch[];
}

export interface TeamMatchInput {
  divisionId: string;
  weekNo: number;
  homeTeamId: string;
  awayTeamId: string;
  venueId?: string | null;
  scheduledAt: string;
}

export type TeamMatchPatch = Partial<Omit<TeamMatchInput, 'divisionId'>> & {
  status?: TeamMatchStatus;
};

export interface TeamMatchFilters {
  sessionId: string;
  weekNo?: number;
  divisionId?: string;
  // Matches the team on either side, home or away.
  teamId?: string;
  status?: TeamMatchStatus;
  sort?: TeamMatchSort;
}

// No points field: the server computes them, and the snapshots, from what is sent here.
export interface IndividualMatchPatch {
  homePlayerId?: string | null;
  awayPlayerId?: string | null;
  homeGames?: number;
  awayGames?: number;
  innings?: number | null;
  homeDefShots?: number;
  awayDefShots?: number;
  status?: IndividualMatchStatus;
}

export interface RosterEntry {
  playerId: string;
  fullName: string;
  skillLevel: number;
}
