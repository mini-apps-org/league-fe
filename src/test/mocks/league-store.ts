import type {
  Division,
  IndividualMatch,
  LeagueSession,
  RosterEntry,
  TeamMatchStatus,
  TeamRef,
  VenueRef,
} from '@/types/league';

import { createLeagueSeed } from './league-seed';

// Rows mirror league-be's tables: foreign keys instead of the nested refs the API returns.
// league-views.ts turns them into response shapes. A session's weekCount and
// hasSubmittedResults are derived per response, so the row leaves them out.
export type SessionRow = Omit<LeagueSession, 'weekCount' | 'hasSubmittedResults'>;

export interface TeamRow extends TeamRef {
  divisionId: string;
  venueId: string | null;
}

export interface PlayerRow extends RosterEntry {
  teamId: string;
}

export interface TeamMatchRow {
  id: string;
  divisionId: string;
  weekNo: number;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string | null;
  scheduledAt: string;
  status: TeamMatchStatus;
  homePoints: number;
  awayPoints: number;
}

export interface IndividualMatchRow extends Omit<
  IndividualMatch,
  'homePlayerName' | 'awayPlayerName'
> {
  teamMatchId: string;
}

export interface LeagueStore {
  sessions: SessionRow[];
  divisions: Division[];
  teams: TeamRow[];
  players: PlayerRow[];
  venues: VenueRef[];
  teamMatches: TeamMatchRow[];
  individualMatches: IndividualMatchRow[];
}

// Module state on purpose: the dev worker and every test share one in-memory "database",
// and tests call resetLeagueStore() so each starts from the same seed.
let store: LeagueStore = createLeagueSeed();
let nextMockId = 1;

export const getLeagueStore = (): LeagueStore => {
  return store;
};

export const updateLeagueStore = (recipe: (current: LeagueStore) => LeagueStore): void => {
  store = recipe(store);
};

export const resetLeagueStore = (): void => {
  store = createLeagueSeed();
  nextMockId = 1;
};

export const createMockId = (prefix: string): string => {
  const id = `${prefix}-new-${nextMockId}`;
  nextMockId += 1;

  return id;
};
