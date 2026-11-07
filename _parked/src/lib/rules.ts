// A mirror of two things the database owns: the Equalizer race chart and the points rule.
//
// It exists ONLY to preview a race or a result before the individual_matches row is saved.
// Once the row exists, render the server's home_race / home_points and never these numbers.
// If the two ever disagree, the server is right and rules.test.ts is the bug report.

export const SKILL_LEVEL_MIN = 2;
export const SKILL_LEVEL_MAX = 7;

export type SkillLevel = 2 | 3 | 4 | 5 | 6 | 7;

export type Side = 'home' | 'away';

// Copied verbatim from league-be/db/migrations/00001_init.sql. The chart is DATA, not a
// formula: deriving it arithmetically is how a mirror drifts from the table it mirrors.
// Keyed `${skillLevelA}-${skillLevelB}`, value [raceA, raceB].
const RACE_CHART: Readonly<Record<string, readonly [number, number]>> = {
  '2-2': [2, 2],
  '2-3': [2, 3],
  '2-4': [2, 4],
  '2-5': [2, 5],
  '2-6': [2, 6],
  '2-7': [2, 7],
  '3-2': [3, 2],
  '3-3': [2, 2],
  '3-4': [2, 3],
  '3-5': [2, 4],
  '3-6': [2, 5],
  '3-7': [2, 6],
  '4-2': [4, 2],
  '4-3': [3, 2],
  '4-4': [3, 3],
  '4-5': [3, 4],
  '4-6': [3, 5],
  '4-7': [2, 5],
  '5-2': [5, 2],
  '5-3': [4, 2],
  '5-4': [4, 3],
  '5-5': [4, 4],
  '5-6': [4, 5],
  '5-7': [3, 5],
  '6-2': [6, 2],
  '6-3': [5, 2],
  '6-4': [5, 3],
  '6-5': [5, 4],
  '6-6': [5, 5],
  '6-7': [4, 5],
  '7-2': [7, 2],
  '7-3': [6, 2],
  '7-4': [5, 2],
  '7-5': [5, 3],
  '7-6': [5, 4],
  '7-7': [5, 5],
};

export interface Race {
  home: number;
  away: number;
}

// Returns null rather than throwing: both skill levels normally come from the server, where
// a CHECK keeps them in 2..7, but a preview must never crash a render.
export function raceFor(homeSkillLevel: number, awaySkillLevel: number): Race | null {
  const row = RACE_CHART[`${homeSkillLevel}-${awaySkillLevel}`];

  if (row === undefined) {
    return null;
  }

  return { home: row[0], away: row[1] };
}

export type MatchVerdict =
  // Neither player has reached their race yet.
  | { status: 'pending' }
  // Games exceed a race, which the stepper caps make unreachable through the UI. The
  // database raises on this, so showing nothing is closer to the truth than clamping.
  | { status: 'invalid' }
  | { status: 'complete'; winner: Side; homePoints: number; awayPoints: number };

// POINTS RULE — mirrors fn_score_individual_match() in
// league-be/db/migrations/00002_business_rules.sql.
//
// ASSUMPTION, pending confirmation: the hill is race - 1. The kickoff prompt says
// "3-0 shutout, 2-1 if loser reached the hill, else 2-0" but then gives
// "4-2 when loser race 5 = 2/1 (hill)", which contradicts it — a loser racing to 5 who won
// 2 games is three short of the hill. Treated as a typo here.
//
// Consequence: a match totals 3, 3 or 2 points, NOT always 3. The plain-win branch totals 2.
// Change this function and the SQL together.
export function pointsFor(
  homeGames: number,
  awayGames: number,
  homeRace: number,
  awayRace: number,
): MatchVerdict {
  if (homeGames > homeRace || awayGames > awayRace) {
    return { status: 'invalid' };
  }

  const homeWon = homeGames >= homeRace;
  const awayWon = awayGames >= awayRace;

  // Both reaching their race is impossible in a real match.
  if (homeWon && awayWon) {
    return { status: 'invalid' };
  }

  if (!homeWon && !awayWon) {
    return { status: 'pending' };
  }

  const winner: Side = homeWon ? 'home' : 'away';
  const loserGames = homeWon ? awayGames : homeGames;
  const loserRace = homeWon ? awayRace : homeRace;

  let winnerPoints: number;
  let loserPoints: number;

  if (loserGames === 0) {
    winnerPoints = 3;
    loserPoints = 0;
  } else if (loserGames >= loserRace - 1) {
    winnerPoints = 2;
    loserPoints = 1;
  } else {
    winnerPoints = 2;
    loserPoints = 0;
  }

  return {
    status: 'complete',
    winner,
    homePoints: homeWon ? winnerPoints : loserPoints,
    awayPoints: homeWon ? loserPoints : winnerPoints,
  };
}

// The 23-Rule total a side has committed so far. Display only — the block decision belongs
// to the server's can_put_up(), which also knows about rosters and duplicate put-ups.
export function skillLevelUsed(skillLevels: readonly number[]): number {
  return skillLevels.reduce((sum, level) => sum + level, 0);
}
