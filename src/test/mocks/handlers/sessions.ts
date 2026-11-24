import { http } from 'msw';
import { z } from 'zod';

import { ENDPOINTS } from '@/api/endpoints';
import { ERROR_CODE } from '@/types/errors';
import type { SessionFilters } from '@/types/league';
import type { LeagueSessionWire } from '@/types/league-wire';

import {
  apiError,
  apiUrl,
  envelope,
  listEnvelope,
  noContent,
  notFound,
  readJsonBody,
  validationFailed,
} from '../http';
import { MOCK_LEAGUE_ID } from '../league-seed';
import {
  createMockId,
  getLeagueStore,
  type LeagueStore,
  type SessionRow,
  updateLeagueStore,
} from '../league-store';
import { getSessionDivisionIds, getSessionWeeks, toSessionView } from '../league-views';
import { applyLeagueSessionBody, toLeagueSessionWire, toSessionWeekWire } from '../league-wire';

const SESSION_TYPES = ['SPRING', 'SUMMER', 'FALL'] as const;
const SESSION_STATUSES = ['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'] as const;
const SESSION_SORTS = [
  'name',
  '-name',
  'starts_on',
  '-starts_on',
  'season_year',
  '-season_year',
] as const;

// Strict and snake_case, like league-be's DecodeJSON: an unknown field, a camelCase one
// included, is a 400001 rather than silently dropped. Limits match internal/sessions.
const sessionInputSchema = z.strictObject({
  name: z.string().trim().min(3).max(60),
  session_type: z.enum(SESSION_TYPES),
  season_year: z.int().min(2000).max(2100),
  starts_on: z.iso.date(),
  ends_on: z.iso.date(),
  status: z.enum(SESSION_STATUSES).optional(),
  is_active: z.boolean().optional(),
});

const sessionPatchSchema = sessionInputSchema.partial();

const sessionQuerySchema = z.object({
  q: z.string().optional(),
  sessionType: z.enum(SESSION_TYPES).optional(),
  seasonYear: z.coerce.number().int().optional(),
  status: z.enum(SESSION_STATUSES).optional(),
  sort: z.enum(SESSION_SORTS).default('-starts_on'),
});

const readSessionQuery = (url: URL): SessionFilters | null => {
  const parsed = sessionQuerySchema.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    sessionType: url.searchParams.get('session_type') ?? undefined,
    seasonYear: url.searchParams.get('season_year') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
  });

  return parsed.success ? parsed.data : null;
};

const compareSessions = (a: SessionRow, b: SessionRow, field: string): number => {
  if (field === 'name') {
    return a.name.localeCompare(b.name);
  }

  if (field === 'season_year' && a.seasonYear !== b.seasonYear) {
    return a.seasonYear - b.seasonYear;
  }

  return a.startsOn.localeCompare(b.startsOn);
};

const filterSessions = (sessions: SessionRow[], filters: SessionFilters): SessionRow[] => {
  const needle = filters.q?.trim().toLowerCase() ?? '';
  const sort = filters.sort ?? '-starts_on';
  const direction = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');

  return sessions
    .filter((session) => session.name.toLowerCase().includes(needle))
    .filter((session) => !filters.sessionType || session.sessionType === filters.sessionType)
    .filter((session) => !filters.seasonYear || session.seasonYear === filters.seasonYear)
    .filter((session) => !filters.status || session.status === filters.status)
    .sort((a, b) => direction * compareSessions(a, b, field));
};

// Mirrors the table's CHECK (ends_on >= starts_on) and UNIQUE (league_id, name).
const findSessionProblem = (
  store: LeagueStore,
  session: SessionRow,
): 'invalid' | 'conflict' | null => {
  if (session.endsOn < session.startsOn) {
    return 'invalid';
  }

  const isDuplicate = store.sessions.some(
    (other) =>
      other.id !== session.id && other.leagueId === session.leagueId && other.name === session.name,
  );

  return isDuplicate ? 'conflict' : null;
};

const rejectProblem = (problem: 'invalid' | 'conflict'): ReturnType<typeof validationFailed> => {
  return problem === 'conflict' ? apiError(409, ERROR_CODE.CONFLICT) : validationFailed();
};

const deleteSessionCascade = (store: LeagueStore, sessionId: string): LeagueStore => {
  const divisionIds = getSessionDivisionIds(store, sessionId);
  const teamIds = new Set(
    store.teams.filter((team) => divisionIds.has(team.divisionId)).map((team) => team.id),
  );
  const teamMatchIds = new Set(
    store.teamMatches
      .filter((teamMatch) => divisionIds.has(teamMatch.divisionId))
      .map((teamMatch) => teamMatch.id),
  );

  return {
    ...store,
    sessions: store.sessions.filter((session) => session.id !== sessionId),
    divisions: store.divisions.filter((division) => !divisionIds.has(division.id)),
    teams: store.teams.filter((team) => !teamIds.has(team.id)),
    players: store.players.filter((player) => !teamIds.has(player.teamId)),
    teamMatches: store.teamMatches.filter((teamMatch) => !teamMatchIds.has(teamMatch.id)),
    individualMatches: store.individualMatches.filter(
      (match) => !teamMatchIds.has(match.teamMatchId),
    ),
  };
};

// One active session per league: activating a session deactivates the league's others.
const saveSession = (store: LeagueStore, session: SessionRow): LeagueStore => {
  const others = store.sessions
    .filter((candidate) => candidate.id !== session.id)
    .map((candidate) => {
      const isSameLeague = candidate.leagueId === session.leagueId;

      return session.isActive && isSameLeague ? { ...candidate, isActive: false } : candidate;
    });

  return { ...store, sessions: [...others, session] };
};

const findSession = (sessionId: string): SessionRow | undefined => {
  return getLeagueStore().sessions.find((session) => session.id === sessionId);
};

const toSessionWire = (store: LeagueStore, session: SessionRow): LeagueSessionWire => {
  return toLeagueSessionWire(toSessionView(store, session));
};

const SESSION_PATH = `${ENDPOINTS.SESSIONS}/:sessionId`;

export const sessionHandlers = [
  http.get(apiUrl(ENDPOINTS.SESSIONS), ({ request }) => {
    const filters = readSessionQuery(new URL(request.url));
    if (!filters) {
      return validationFailed();
    }

    const store = getLeagueStore();

    return listEnvelope(
      filterSessions(store.sessions, filters).map((session) => toSessionWire(store, session)),
    );
  }),

  http.get<{ sessionId: string }>(apiUrl(SESSION_PATH), ({ params }) => {
    const session = findSession(params.sessionId);

    return session ? envelope(toSessionWire(getLeagueStore(), session)) : notFound();
  }),

  http.get<{ sessionId: string }>(apiUrl(`${SESSION_PATH}/weeks`), ({ params }) => {
    if (!findSession(params.sessionId)) {
      return notFound();
    }

    return listEnvelope(getSessionWeeks(getLeagueStore(), params.sessionId).map(toSessionWeekWire));
  }),

  http.post(apiUrl(ENDPOINTS.SESSIONS), async ({ request }) => {
    const parsed = sessionInputSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return validationFailed();
    }

    const now = new Date().toISOString();
    const session: SessionRow = {
      id: createMockId('session'),
      leagueId: MOCK_LEAGUE_ID,
      name: parsed.data.name,
      sessionType: parsed.data.session_type,
      seasonYear: parsed.data.season_year,
      startsOn: parsed.data.starts_on,
      endsOn: parsed.data.ends_on,
      status: parsed.data.status ?? 'DRAFT',
      isActive: parsed.data.is_active ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const problem = findSessionProblem(getLeagueStore(), session);
    if (problem) {
      return rejectProblem(problem);
    }

    updateLeagueStore((store) => {
      return saveSession(store, session);
    });

    return envelope(toSessionWire(getLeagueStore(), session), { status: 201 });
  }),

  http.patch<{ sessionId: string }>(apiUrl(SESSION_PATH), async ({ params, request }) => {
    const current = findSession(params.sessionId);
    if (!current) {
      return notFound();
    }

    const parsed = sessionPatchSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return validationFailed();
    }

    const session: SessionRow = {
      ...applyLeagueSessionBody(current, parsed.data),
      updatedAt: new Date().toISOString(),
    };
    const problem = findSessionProblem(getLeagueStore(), session);
    if (problem) {
      return rejectProblem(problem);
    }

    updateLeagueStore((store) => {
      return saveSession(store, session);
    });

    return envelope(toSessionWire(getLeagueStore(), session));
  }),

  http.delete<{ sessionId: string }>(apiUrl(SESSION_PATH), ({ params }) => {
    if (!findSession(params.sessionId)) {
      return notFound();
    }

    updateLeagueStore((store) => {
      return deleteSessionCascade(store, params.sessionId);
    });

    return noContent();
  }),
];
