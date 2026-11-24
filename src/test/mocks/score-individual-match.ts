import { pointsFor, raceFor } from '@/lib/rules';
import type { IndividualMatchPatch, Side } from '@/types/league';

import type { IndividualMatchRow, LeagueStore, TeamMatchRow } from './league-store';

// Stands in for league-be's put-up and scoring triggers: snapshot skill levels and races when
// a player is put up, then score the games. Returns null for anything the database would
// reject, which the handler turns into a 400001.

interface ScoreRequest {
  store: LeagueStore;
  row: IndividualMatchRow;
  patch: IndividualMatchPatch;
}

const pick = <T>(patched: T | undefined, current: T): T => {
  return patched === undefined ? current : patched;
};

const isOnTeam = (store: LeagueStore, playerId: string, teamId: string): boolean => {
  return store.players.some((player) => player.playerId === playerId && player.teamId === teamId);
};

// A player plays at most one match per night (R-036).
const isUsedElsewhereTonight = (request: ScoreRequest, playerId: string): boolean => {
  return request.store.individualMatches.some(
    (match) =>
      match.teamMatchId === request.row.teamMatchId &&
      match.id !== request.row.id &&
      (match.homePlayerId === playerId || match.awayPlayerId === playerId),
  );
};

const isPlayerAllowed = (
  request: ScoreRequest,
  playerId: string | null,
  teamId: string,
): boolean => {
  if (playerId === null) {
    return true;
  }

  return isOnTeam(request.store, playerId, teamId) && !isUsedElsewhereTonight(request, playerId);
};

const skillLevelOf = (store: LeagueStore, playerId: string | null): number | null => {
  if (playerId === null) {
    return null;
  }

  return store.players.find((player) => player.playerId === playerId)?.skillLevel ?? null;
};

// A snapshot is taken at put-up and kept while the same player stays in the slot.
const snapshotSide = (
  request: ScoreRequest,
  side: Side,
  playerId: string | null,
): number | null => {
  const currentPlayerId = side === 'home' ? request.row.homePlayerId : request.row.awayPlayerId;
  const currentSkillLevel =
    side === 'home' ? request.row.homeSkillLevel : request.row.awaySkillLevel;

  return playerId === currentPlayerId ? currentSkillLevel : skillLevelOf(request.store, playerId);
};

const withPlayers = (request: ScoreRequest, teamMatch: TeamMatchRow): IndividualMatchRow | null => {
  const homePlayerId = pick(request.patch.homePlayerId, request.row.homePlayerId);
  const awayPlayerId = pick(request.patch.awayPlayerId, request.row.awayPlayerId);
  const playersAllowed =
    isPlayerAllowed(request, homePlayerId, teamMatch.homeTeamId) &&
    isPlayerAllowed(request, awayPlayerId, teamMatch.awayTeamId);

  if (!playersAllowed) {
    return null;
  }

  const homeSkillLevel = snapshotSide(request, 'home', homePlayerId);
  const awaySkillLevel = snapshotSide(request, 'away', awayPlayerId);
  const race =
    homeSkillLevel === null || awaySkillLevel === null
      ? null
      : raceFor(homeSkillLevel, awaySkillLevel);

  return {
    ...request.row,
    homePlayerId,
    awayPlayerId,
    homeSkillLevel,
    awaySkillLevel,
    homeRace: race?.home ?? null,
    awayRace: race?.away ?? null,
  };
};

const withScore = (request: ScoreRequest, row: IndividualMatchRow): IndividualMatchRow | null => {
  const homeGames = pick(request.patch.homeGames, row.homeGames);
  const awayGames = pick(request.patch.awayGames, row.awayGames);
  const scored = {
    ...row,
    homeGames,
    awayGames,
    innings: pick(request.patch.innings, row.innings),
    homeDefShots: pick(request.patch.homeDefShots, row.homeDefShots),
    awayDefShots: pick(request.patch.awayDefShots, row.awayDefShots),
  };

  if (row.homeRace === null || row.awayRace === null) {
    const hasGames = homeGames > 0 || awayGames > 0;

    return hasGames || request.patch.status === 'complete'
      ? null
      : { ...scored, homePoints: 0, awayPoints: 0, status: 'pending' };
  }

  const verdict = pointsFor({
    homeGames,
    awayGames,
    homeRace: row.homeRace,
    awayRace: row.awayRace,
  });
  if (verdict.status === 'invalid') {
    return null;
  }

  const status = verdict.status === 'complete' ? 'complete' : 'pending';
  if (request.patch.status !== undefined && request.patch.status !== status) {
    return null;
  }

  return {
    ...scored,
    status,
    homePoints: verdict.status === 'complete' ? verdict.homePoints : 0,
    awayPoints: verdict.status === 'complete' ? verdict.awayPoints : 0,
  };
};

export const scoreIndividualMatch = (request: ScoreRequest): IndividualMatchRow | null => {
  const teamMatch = request.store.teamMatches.find((match) => match.id === request.row.teamMatchId);
  if (!teamMatch) {
    return null;
  }

  const withPutUps = withPlayers(request, teamMatch);

  return withPutUps ? withScore(request, withPutUps) : null;
};

// Team points are the sum of the night's individual points; the first put-up starts the night.
export const rollUpNight = (store: LeagueStore, teamMatchId: string): LeagueStore => {
  const night = store.individualMatches.filter((match) => match.teamMatchId === teamMatchId);
  const hasPutUp = night.some(
    (match) => match.homePlayerId !== null || match.awayPlayerId !== null,
  );

  return {
    ...store,
    teamMatches: store.teamMatches.map((teamMatch) => {
      if (teamMatch.id !== teamMatchId) {
        return teamMatch;
      }

      return {
        ...teamMatch,
        homePoints: night.reduce((sum, match) => sum + match.homePoints, 0),
        awayPoints: night.reduce((sum, match) => sum + match.awayPoints, 0),
        status: teamMatch.status === 'scheduled' && hasPutUp ? 'in_progress' : teamMatch.status,
      };
    }),
  };
};
