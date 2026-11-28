import { omit } from 'lodash-es';
import { z } from 'zod';

import type { Division, VenueOption } from '@/types/league';

import sessionsResponse from './data/sessions.json';
import { buildNight, MATCHES_PER_NIGHT } from './league-night';
import type {
  IndividualMatchRow,
  LeagueStore,
  PlayerRow,
  SessionRow,
  TeamMatchRow,
  TeamRow,
} from './league-store';

const TEAMS_PER_DIVISION = 4;
const PLAYERS_PER_TEAM = 6;
const DAY_MS = 24 * 60 * 60 * 1000;
// 19:00 in Ho Chi Minh City.
const NIGHT_START_UTC = 'T12:00:00.000Z';

// data/sessions.json is a GET /api/v1/sessions response, kept in the contract's shape so it
// doubles as the sample for league-be. The store seeds its sessions from `data`, then
// generates `weekCount` weeks of matches for each one.
const sessionsResponseSchema = z.object({
  metadata: z.object({ count: z.int(), has_more: z.boolean() }),
  data: z.array(
    z.object({
      id: z.uuid(),
      leagueId: z.uuid(),
      name: z.string().min(1),
      sessionType: z.enum(['SPRING', 'SUMMER', 'FALL']),
      seasonYear: z.int(),
      startsOn: z.iso.date(),
      endsOn: z.iso.date(),
      status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED']),
      isActive: z.boolean(),
      weekCount: z.int().min(0),
      hasSubmittedResults: z.boolean(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
    }),
  ),
});

type SessionFixture = z.infer<typeof sessionsResponseSchema>['data'][number];

// Parsed, not cast: a typo in the JSON fails loudly at startup instead of rendering nonsense.
const SESSION_FIXTURES: SessionFixture[] = sessionsResponseSchema.parse(sessionsResponse).data;

export const MOCK_LEAGUE_ID = SESSION_FIXTURES[0]?.leagueId ?? 'league-mock';

const DIVISION_NAMES = ['8-Ball Open', '8-Ball Classic'];
const TEAM_NAMES = [
  'Corner Pocket',
  'Break Point',
  'Side Spin',
  'Eight Masters',
  'Bank Shot',
  'Cue Crew',
  'Rack Attack',
  'Chalk Dust',
];
const PLAYER_NAMES = ['Minh', 'Lan', 'Huy', 'Thao', 'Khoa', 'Vy', 'Duc', 'Ngoc', 'Tuan', 'Mai'];

export const MOCK_VENUES: VenueOption[] = [
  { id: 'venue-saigon', name: 'Saigon Billiards Club' },
  { id: 'venue-district-1', name: 'District 1 Cue Hall' },
];

// Circle-method pairings for four teams, by index: three rounds cover every pairing once.
const ROUNDS: readonly (readonly [number, number])[][] = [
  [
    [0, 3],
    [1, 2],
  ],
  [
    [0, 2],
    [3, 1],
  ],
  [
    [0, 1],
    [2, 3],
  ],
];

const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);

  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
};

// weekCount and hasSubmittedResults are derived from the generated matches, as the server does.
const buildSession = (fixture: SessionFixture): SessionRow => {
  return omit(fixture, ['weekCount', 'hasSubmittedResults']);
};

// A finished or cancelled session has every week submitted and a draft none. An in-progress
// one has submitted every night before today, so the current week shows as in progress.
const getSubmittedWeeks = (fixture: SessionFixture, today: Date): number => {
  if (fixture.status === 'DRAFT') {
    return 0;
  }
  if (fixture.status !== 'IN_PROGRESS') {
    return fixture.weekCount;
  }

  const todayIso = today.toISOString().slice(0, 10);
  const nights = Array.from({ length: fixture.weekCount }, (_, index) => {
    return addDays(fixture.startsOn, index * 7);
  });

  return nights.filter((night) => night < todayIso).length;
};

const buildTeams = (division: Division, divisionIndex: number): TeamRow[] => {
  return Array.from({ length: TEAMS_PER_DIVISION }, (_, teamIndex) => {
    const nameIndex = (divisionIndex * TEAMS_PER_DIVISION + teamIndex) % TEAM_NAMES.length;

    return {
      id: `${division.id}-team-${teamIndex + 1}`,
      divisionId: division.id,
      teamNumber: `0${divisionIndex + 1}20${teamIndex + 1}`,
      name: TEAM_NAMES[nameIndex] ?? `Team ${teamIndex + 1}`,
      venueId: MOCK_VENUES[teamIndex % MOCK_VENUES.length]?.id ?? null,
    };
  });
};

const buildPlayers = (team: TeamRow, teamIndex: number): PlayerRow[] => {
  return Array.from({ length: PLAYERS_PER_TEAM }, (_, playerIndex) => {
    const first = PLAYER_NAMES[(teamIndex + playerIndex) % PLAYER_NAMES.length] ?? 'Player';

    return {
      playerId: `${team.id}-player-${playerIndex + 1}`,
      teamId: team.id,
      fullName: `${first} ${team.name.split(' ')[0] ?? ''}`.trim(),
      // Skill levels 2..7, rotated per team so every pairing differs.
      skillLevel: ((playerIndex + teamIndex) % 6) + 2,
    };
  });
};

interface DivisionSchedule {
  fixture: SessionFixture;
  submittedWeeks: number;
  session: SessionRow;
  division: Division;
  teams: TeamRow[];
  players: PlayerRow[];
}

const playedMatchesFor = (submittedWeeks: number, weekNo: number): number => {
  if (weekNo <= submittedWeeks) {
    return MATCHES_PER_NIGHT;
  }

  return weekNo === submittedWeeks + 1 ? 2 : 0;
};

const statusFor = (playedMatches: number): TeamMatchRow['status'] => {
  if (playedMatches === MATCHES_PER_NIGHT) {
    return 'submitted';
  }

  return playedMatches > 0 ? 'in_progress' : 'scheduled';
};

const buildDivisionSchedule = (schedule: DivisionSchedule): LeagueStore => {
  const teamMatches: TeamMatchRow[] = [];
  const individualMatches: IndividualMatchRow[] = [];

  for (let weekNo = 1; weekNo <= schedule.fixture.weekCount; weekNo += 1) {
    const round = ROUNDS[(weekNo - 1) % ROUNDS.length] ?? [];
    const isReturnLeg = Math.floor((weekNo - 1) / ROUNDS.length) % 2 === 1;
    const playedMatches = playedMatchesFor(schedule.submittedWeeks, weekNo);

    round.forEach(([first, second], pairIndex) => {
      const home = schedule.teams[isReturnLeg ? second : first];
      const away = schedule.teams[isReturnLeg ? first : second];
      if (!home || !away) {
        return;
      }

      const teamMatch: TeamMatchRow = {
        id: `${schedule.division.id}-w${weekNo}-${pairIndex + 1}`,
        divisionId: schedule.division.id,
        weekNo,
        homeTeamId: home.id,
        awayTeamId: away.id,
        venueId: home.venueId,
        scheduledAt: `${addDays(schedule.session.startsOn, (weekNo - 1) * 7)}${NIGHT_START_UTC}`,
        status: statusFor(playedMatches),
        homePoints: 0,
        awayPoints: 0,
      };
      const night = buildNight({
        teamMatch,
        homePlayers: schedule.players.filter((player) => player.teamId === home.id),
        awayPlayers: schedule.players.filter((player) => player.teamId === away.id),
        playedMatches,
      });

      teamMatches.push({
        ...teamMatch,
        homePoints: night.reduce((sum, match) => sum + match.homePoints, 0),
        awayPoints: night.reduce((sum, match) => sum + match.awayPoints, 0),
      });
      individualMatches.push(...night);
    });
  }

  return { ...emptyStore(), teamMatches, individualMatches };
};

const emptyStore = (): LeagueStore => {
  return {
    sessions: [],
    divisions: [],
    teams: [],
    players: [],
    venues: [],
    teamMatches: [],
    individualMatches: [],
  };
};

const mergeStores = (target: LeagueStore, source: LeagueStore): LeagueStore => {
  return {
    sessions: [...target.sessions, ...source.sessions],
    divisions: [...target.divisions, ...source.divisions],
    teams: [...target.teams, ...source.teams],
    players: [...target.players, ...source.players],
    venues: [...target.venues, ...source.venues],
    teamMatches: [...target.teamMatches, ...source.teamMatches],
    individualMatches: [...target.individualMatches, ...source.individualMatches],
  };
};

const buildSessionStore = (fixture: SessionFixture): LeagueStore => {
  const session = buildSession(fixture);
  const submittedWeeks = getSubmittedWeeks(fixture, new Date());

  return DIVISION_NAMES.reduce<LeagueStore>(
    (sessionStore, divisionName, divisionIndex) => {
      const division: Division = {
        id: `${session.id}-division-${divisionIndex + 1}`,
        seasonId: session.id,
        name: divisionName,
        skillLevelCap: 23,
      };
      const teams = buildTeams(division, divisionIndex);
      const players = teams.flatMap((team, teamIndex) => buildPlayers(team, teamIndex));
      const schedule = buildDivisionSchedule({
        fixture,
        submittedWeeks,
        session,
        division,
        teams,
        players,
      });

      return mergeStores(sessionStore, {
        ...schedule,
        divisions: [division],
        teams,
        players,
      });
    },
    { ...emptyStore(), sessions: [session] },
  );
};

export const createLeagueSeed = (): LeagueStore => {
  const seeded = SESSION_FIXTURES.map(buildSessionStore).reduce(mergeStores, emptyStore());

  return { ...seeded, venues: MOCK_VENUES };
};
