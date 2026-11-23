import { pointsFor, raceFor } from '@/lib/rules';

import type { IndividualMatchRow, PlayerRow, TeamMatchRow } from './league-store';

export const MATCHES_PER_NIGHT = 5;

export const buildPendingMatch = (teamMatchId: string, matchOrder: number): IndividualMatchRow => {
  return {
    id: `${teamMatchId}-match-${matchOrder}`,
    teamMatchId,
    matchOrder,
    // Home puts up first in match 1, then it alternates.
    firstPutUp: matchOrder % 2 === 1 ? 'home' : 'away',
    status: 'pending',
    homePlayerId: null,
    awayPlayerId: null,
    homeSkillLevel: null,
    awaySkillLevel: null,
    homeRace: null,
    awayRace: null,
    homeGames: 0,
    awayGames: 0,
    innings: null,
    homeDefShots: 0,
    awayDefShots: 0,
    homePoints: 0,
    awayPoints: 0,
  };
};

export interface NightContext {
  teamMatch: TeamMatchRow;
  homePlayers: PlayerRow[];
  awayPlayers: PlayerRow[];
  playedMatches: number;
}

const buildPlayedMatch = (context: NightContext, matchOrder: number): IndividualMatchRow => {
  const pending = buildPendingMatch(context.teamMatch.id, matchOrder);
  const home = context.homePlayers[matchOrder - 1];
  const away = context.awayPlayers[matchOrder - 1];
  const race = home && away ? raceFor(home.skillLevel, away.skillLevel) : null;

  if (!home || !away || !race || matchOrder > context.playedMatches) {
    return pending;
  }

  // Deterministic but varied: the winner alternates and the loser's games cycle below the hill.
  const variety = context.teamMatch.weekNo + matchOrder;
  const homeWins = variety % 2 === 0;
  const homeGames = homeWins ? race.home : variety % race.home;
  const awayGames = homeWins ? variety % race.away : race.away;
  const verdict = pointsFor({ homeGames, awayGames, homeRace: race.home, awayRace: race.away });
  const isComplete = verdict.status === 'complete';

  return {
    ...pending,
    homePlayerId: home.playerId,
    awayPlayerId: away.playerId,
    homeSkillLevel: home.skillLevel,
    awaySkillLevel: away.skillLevel,
    homeRace: race.home,
    awayRace: race.away,
    homeGames,
    awayGames,
    innings: 10 + variety,
    homeDefShots: variety % 3,
    awayDefShots: (variety + 1) % 3,
    homePoints: isComplete ? verdict.homePoints : 0,
    awayPoints: isComplete ? verdict.awayPoints : 0,
    status: isComplete ? 'complete' : 'pending',
  };
};

export const buildNight = (context: NightContext): IndividualMatchRow[] => {
  return Array.from({ length: MATCHES_PER_NIGHT }, (_, index) => {
    return buildPlayedMatch(context, index + 1);
  });
};
