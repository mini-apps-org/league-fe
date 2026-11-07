import { describe, expect, it } from 'vitest';

import { pointsFor, raceFor, skillLevelUsed, SKILL_LEVEL_MAX, SKILL_LEVEL_MIN } from './rules';

const SKILL_LEVELS = [2, 3, 4, 5, 6, 7] as const;

describe('raceFor', () => {
  // The two vectors named in the kickoff prompt.
  it('gives 5-5 for SL6 v SL6', () => {
    expect(raceFor(6, 6)).toEqual({ home: 5, away: 5 });
  });

  it('gives 3-4 for SL4 v SL5', () => {
    expect(raceFor(4, 5)).toEqual({ home: 3, away: 4 });
  });

  // The chart is hand-copied from the migration, so completeness and symmetry are the two
  // properties that catch a transcription slip.
  it('covers every skill level pairing from 2 to 7', () => {
    for (const home of SKILL_LEVELS) {
      for (const away of SKILL_LEVELS) {
        expect(raceFor(home, away), `${home} v ${away}`).not.toBeNull();
      }
    }
  });

  it('is symmetric: (a,b) -> (x,y) implies (b,a) -> (y,x)', () => {
    for (const home of SKILL_LEVELS) {
      for (const away of SKILL_LEVELS) {
        const forward = raceFor(home, away);
        const reverse = raceFor(away, home);

        expect({ home: reverse?.away, away: reverse?.home }, `${home} v ${away}`).toEqual({
          home: forward?.home,
          away: forward?.away,
        });
      }
    }
  });

  it('returns null outside 2-7 rather than throwing', () => {
    expect(raceFor(SKILL_LEVEL_MIN - 1, 5)).toBeNull();
    expect(raceFor(5, SKILL_LEVEL_MAX + 1)).toBeNull();
  });
});

describe('pointsFor', () => {
  it('awards 3-0 for a shutout', () => {
    expect(pointsFor(3, 0, 3, 4)).toEqual({
      status: 'complete',
      winner: 'home',
      homePoints: 3,
      awayPoints: 0,
    });
  });

  it('awards 2-1 when the loser reached the hill', () => {
    // Loser races to 4 and won 3 — one short, so on the hill.
    expect(pointsFor(4, 3, 4, 4)).toEqual({
      status: 'complete',
      winner: 'home',
      homePoints: 2,
      awayPoints: 1,
    });
  });

  it('awards 2-0 for a win with the loser short of the hill', () => {
    // Loser races to 3 and won 1 — two short.
    expect(pointsFor(4, 1, 4, 3)).toEqual({
      status: 'complete',
      winner: 'home',
      homePoints: 2,
      awayPoints: 0,
    });
  });

  it('awards 2-0 for 5-2 where the loser races to 5', () => {
    // The prompt's own worked example.
    expect(pointsFor(5, 2, 5, 5)).toEqual({
      status: 'complete',
      winner: 'home',
      homePoints: 2,
      awayPoints: 0,
    });
  });

  it('scores an away win the same way', () => {
    expect(pointsFor(0, 4, 3, 4)).toEqual({
      status: 'complete',
      winner: 'away',
      homePoints: 0,
      awayPoints: 3,
    });
  });

  it('is pending until someone reaches their race', () => {
    expect(pointsFor(2, 2, 4, 4)).toEqual({ status: 'pending' });
    expect(pointsFor(0, 0, 3, 3)).toEqual({ status: 'pending' });
  });

  it('is invalid when games exceed a race', () => {
    expect(pointsFor(5, 0, 4, 4)).toEqual({ status: 'invalid' });
    expect(pointsFor(0, 5, 4, 4)).toEqual({ status: 'invalid' });
  });

  // Documents the deviation from the original plan, which asserted a constant 3.
  it('totals 3, 3 or 2 points — not always 3', () => {
    const totals = [
      pointsFor(3, 0, 3, 4), // shutout
      pointsFor(4, 3, 4, 4), // hill
      pointsFor(4, 1, 4, 3), // plain win
    ].map((verdict) => {
      return verdict.status === 'complete' ? verdict.homePoints + verdict.awayPoints : null;
    });

    expect(totals).toEqual([3, 3, 2]);
  });
});

describe('skillLevelUsed', () => {
  it('sums a side committed skill levels', () => {
    expect(skillLevelUsed([4, 5, 5, 6])).toBe(20);
  });

  it('is 0 before anyone is put up', () => {
    expect(skillLevelUsed([])).toBe(0);
  });
});
