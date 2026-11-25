import { omit } from 'lodash-es';

import type {
  AdminTeamMatch,
  AdminTeamMatchDetail,
  IndividualMatch,
  LeagueSession,
  SessionWeek,
  TeamRef,
} from '@/types/league';

import type {
  IndividualMatchRow,
  LeagueStore,
  SessionRow,
  TeamMatchRow,
  TeamRow,
} from './league-store';

// The store keeps its foreign keys consistent, so a dangling one is a bug in the mock itself.
const requireRow = <T>(row: T | undefined, description: string): T => {
  if (row === undefined) {
    throw new Error(`mock league store is missing ${description}`);
  }

  return row;
};

const toTeamRef = (team: TeamRow): TeamRef => {
  return { id: team.id, teamNumber: team.teamNumber, name: team.name };
};

const findTeam = (store: LeagueStore, teamId: string): TeamRow => {
  return requireRow(
    store.teams.find((team) => team.id === teamId),
    `team ${teamId}`,
  );
};

const playerName = (store: LeagueStore, playerId: string | null): string | null => {
  if (playerId === null) {
    return null;
  }

  return store.players.find((player) => player.playerId === playerId)?.fullName ?? null;
};

export const toIndividualMatch = (store: LeagueStore, row: IndividualMatchRow): IndividualMatch => {
  return {
    ...omit(row, 'teamMatchId'),
    homePlayerName: playerName(store, row.homePlayerId),
    awayPlayerName: playerName(store, row.awayPlayerId),
  };
};

export const toAdminTeamMatch = (store: LeagueStore, row: TeamMatchRow): AdminTeamMatch => {
  const division = requireRow(
    store.divisions.find((candidate) => candidate.id === row.divisionId),
    `division ${row.divisionId}`,
  );
  const venue = store.venues.find((candidate) => candidate.id === row.venueId) ?? null;

  return {
    id: row.id,
    sessionId: division.seasonId,
    division: { id: division.id, name: division.name },
    weekNo: row.weekNo,
    scheduledAt: row.scheduledAt,
    status: row.status,
    homeTeam: toTeamRef(findTeam(store, row.homeTeamId)),
    awayTeam: toTeamRef(findTeam(store, row.awayTeamId)),
    venue,
    homePoints: row.homePoints,
    awayPoints: row.awayPoints,
  };
};

export const toAdminTeamMatchDetail = (
  store: LeagueStore,
  row: TeamMatchRow,
): AdminTeamMatchDetail => {
  const individualMatches = store.individualMatches
    .filter((match) => match.teamMatchId === row.id)
    .sort((a, b) => a.matchOrder - b.matchOrder)
    .map((match) => toIndividualMatch(store, match));

  return { ...toAdminTeamMatch(store, row), individualMatches };
};

export const getSessionDivisionIds = (store: LeagueStore, sessionId: string): Set<string> => {
  return new Set(
    store.divisions
      .filter((division) => division.seasonId === sessionId)
      .map((division) => division.id),
  );
};

export const getSessionTeamMatches = (store: LeagueStore, sessionId: string): TeamMatchRow[] => {
  const divisionIds = getSessionDivisionIds(store, sessionId);

  return store.teamMatches.filter((teamMatch) => divisionIds.has(teamMatch.divisionId));
};

export const getSessionWeeks = (store: LeagueStore, sessionId: string): SessionWeek[] => {
  const weeks = new Map<number, SessionWeek>();

  getSessionTeamMatches(store, sessionId).forEach((teamMatch) => {
    const week = weeks.get(teamMatch.weekNo) ?? {
      weekNo: teamMatch.weekNo,
      matchCount: 0,
      submittedCount: 0,
      firstScheduledAt: teamMatch.scheduledAt,
    };

    weeks.set(teamMatch.weekNo, {
      ...week,
      matchCount: week.matchCount + 1,
      submittedCount: week.submittedCount + (teamMatch.status === 'submitted' ? 1 : 0),
      firstScheduledAt:
        teamMatch.scheduledAt < week.firstScheduledAt
          ? teamMatch.scheduledAt
          : week.firstScheduledAt,
    });
  });

  return [...weeks.values()].sort((a, b) => a.weekNo - b.weekNo);
};

export const toSessionView = (store: LeagueStore, session: SessionRow): LeagueSession => {
  return {
    ...session,
    weekCount: getSessionWeeks(store, session.id).length,
    hasSubmittedResults: getSessionTeamMatches(store, session.id).some(
      (teamMatch) => teamMatch.status === 'submitted',
    ),
  };
};
