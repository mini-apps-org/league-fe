import type { IndividualMatch, RosterPlayer, TeamMatchSummary, TeamRef } from '@/types/league';

export const SAMPLE_SKILL_LEVELS = [2, 3, 4, 5, 6, 7] as const;

export const SAMPLE_FIXTURE: TeamMatchSummary = {
  id: 'gallery-fixture',
  weekNo: 3,
  scheduledAt: '2026-11-10T19:30:00+07:00',
  status: 'in_progress',
  homeTeam: { id: 'home', teamNumber: '03209', name: 'Corner Pocket Crew' },
  awayTeam: { id: 'away', teamNumber: '03214', name: 'Eight Ball Bandits' },
  venue: { id: 'venue', name: 'Saigon Cue Club' },
  homePoints: 7,
  awayPoints: 5,
};

export const SAMPLE_BYE_TEAM: TeamRef = { id: 'bye', teamNumber: '03211', name: 'Rack Attack' };

const BASE_PLAYER: RosterPlayer = {
  playerId: '',
  memberId: '',
  fullName: '',
  skillLevel: 0,
  isPaid: true,
  matchesPlayed: 0,
  matchesWon: 0,
  totalPoints: 0,
};

export const SAMPLE_ROSTER: readonly RosterPlayer[] = [
  {
    ...BASE_PLAYER,
    playerId: 'p1',
    memberId: '95007620',
    fullName: 'Le Minh Quan',
    skillLevel: 7,
    matchesPlayed: 5,
    matchesWon: 3,
    totalPoints: 7,
  },
  {
    ...BASE_PLAYER,
    playerId: 'p2',
    memberId: '95007688',
    fullName: 'Ho Ngoc Lan',
    skillLevel: 2,
    isPaid: false,
  },
  {
    ...BASE_PLAYER,
    playerId: 'p3',
    memberId: '95007658',
    fullName: 'Vo Thanh Tung',
    skillLevel: 5,
    matchesPlayed: 6,
    matchesWon: 4,
    totalPoints: 9,
  },
];

export const SAMPLE_SELECTED_PLAYER_ID = 'p3';

export const SAMPLE_PLAYED_MATCH: IndividualMatch = {
  id: 'm3',
  matchOrder: 3,
  firstPutUp: 'home',
  status: 'complete',
  homePlayerId: 'h3',
  awayPlayerId: 'a3',
  homePlayerName: 'Nguyen Thi Mai',
  awayPlayerName: 'Le Thi Hong',
  homeSkillLevel: 6,
  awaySkillLevel: 5,
  homeRace: 5,
  awayRace: 4,
  homeGames: 5,
  awayGames: 3,
  innings: null,
  homeDefShots: 0,
  awayDefShots: 0,
  homePoints: 2,
  awayPoints: 1,
};

export interface SampleStep {
  name: string;
  label: string;
  initialValue: number;
  max?: number;
}

export const SAMPLE_STEPS: readonly SampleStep[] = [
  { name: 'mid race', label: 'Le Thi Hong', initialValue: 3, max: 4 },
  { name: 'at race', label: 'Nguyen Thi Mai', initialValue: 5, max: 5 },
  { name: 'at zero', label: 'Ho Ngoc Lan', initialValue: 0, max: 3 },
  { name: 'uncapped', label: 'Innings', initialValue: 12 },
];
