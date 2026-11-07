import { describe, expect, it } from 'vitest';

import { firstPutUpFor, isNightComplete, nextAction } from './night';
import type { IndividualMatch, TeamMatchDetail } from '@/types/league';

function match(overrides: Partial<IndividualMatch> & { matchOrder: number }): IndividualMatch {
  return {
    id: `m${overrides.matchOrder}`,
    firstPutUp: overrides.matchOrder % 2 === 1 ? 'home' : 'away',
    status: 'pending',
    homePlayerId: null,
    awayPlayerId: null,
    homePlayerName: null,
    awayPlayerName: null,
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
    ...overrides,
  };
}

function night(matches: IndividualMatch[], status: TeamMatchDetail['status'] = 'scheduled') {
  return {
    id: 'tm1',
    weekNo: 10,
    scheduledAt: '2026-11-10T12:30:00Z',
    status,
    homeTeam: { id: 'h', teamNumber: '03209', name: 'Corner Pocket Crew' },
    awayTeam: { id: 'a', teamNumber: '03214', name: 'Eight Ball Bandits' },
    venue: null,
    homePoints: 0,
    awayPoints: 0,
    divisionId: 'd1',
    skillLevelCap: 23,
    submittedAt: null,
    homeRoster: [],
    awayRoster: [],
    matches,
    viewerCanManage: true,
    viewerSide: 'home' as const,
  } satisfies TeamMatchDetail;
}

const played = (order: number): IndividualMatch => {
  return match({
    matchOrder: order,
    status: 'complete',
    homePlayerId: 'p1',
    awayPlayerId: 'p2',
    homeRace: 3,
    awayRace: 4,
    homeGames: 3,
    homePoints: 3,
  });
};

describe('firstPutUpFor', () => {
  it('starts with home and alternates', () => {
    expect([1, 2, 3, 4, 5].map((order) => firstPutUpFor(order))).toEqual([
      'home',
      'away',
      'home',
      'away',
      'home',
    ]);
  });
});

describe('nextAction', () => {
  it('asks the home side to put up first on an empty night', () => {
    expect(nextAction(night([]))).toEqual({ kind: 'put-up', matchOrder: 1, side: 'home' });
  });

  it('asks the away side once the first-put-up side has picked', () => {
    expect(nextAction(night([match({ matchOrder: 1, homePlayerId: 'p1' })]))).toEqual({
      kind: 'put-up',
      matchOrder: 1,
      side: 'away',
    });
  });

  it('moves to result entry once both players are up', () => {
    const detail = night([match({ matchOrder: 1, homePlayerId: 'p1', awayPlayerId: 'p2' })]);

    expect(nextAction(detail)).toEqual({
      kind: 'result',
      matchOrder: 1,
      individualMatchId: 'm1',
    });
  });

  it('moves to match 2 and the away side after match 1 is scored', () => {
    expect(nextAction(night([played(1)]))).toEqual({
      kind: 'put-up',
      matchOrder: 2,
      side: 'away',
    });
  });

  it('offers submit once all five are complete', () => {
    expect(nextAction(night([1, 2, 3, 4, 5].map(played)))).toEqual({ kind: 'submit' });
  });

  it('is done once the night is submitted', () => {
    expect(nextAction(night([1, 2, 3, 4, 5].map(played), 'submitted'))).toEqual({ kind: 'done' });
  });
});

describe('isNightComplete', () => {
  it('is false mid-night and true after five results', () => {
    expect(isNightComplete(night([played(1)]))).toBe(false);
    expect(isNightComplete(night([1, 2, 3, 4, 5].map(played)))).toBe(true);
  });
});
