import { http } from 'msw';
import { z } from 'zod';

import { ENDPOINTS } from '@/api/endpoints';

import {
  apiUrl,
  envelope,
  listEnvelope,
  noContent,
  notFound,
  readJsonBody,
  validationFailed,
} from '../http';
import { buildPendingMatch, MATCHES_PER_NIGHT } from '../league-night';
import {
  createMockId,
  getLeagueStore,
  type LeagueStore,
  type TeamMatchRow,
  updateLeagueStore,
} from '../league-store';
import { getSessionTeamMatches, toAdminTeamMatch, toAdminTeamMatchDetail } from '../league-views';

const TEAM_MATCH_STATUSES = ['scheduled', 'in_progress', 'submitted'] as const;
const TEAM_MATCH_SORTS = ['week_no', '-week_no', 'scheduled_at', '-scheduled_at'] as const;

const teamMatchInputSchema = z.strictObject({
  divisionId: z.string().min(1),
  weekNo: z.int().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  venueId: z.string().min(1).nullable().optional(),
  scheduledAt: z.iso.datetime({ offset: true }),
});

const teamMatchPatchSchema = teamMatchInputSchema
  .omit({ divisionId: true })
  .partial()
  .extend({ status: z.enum(TEAM_MATCH_STATUSES).optional() });

const teamMatchQuerySchema = z.object({
  sessionId: z.string().optional(),
  divisionId: z.string().optional(),
  weekNo: z.coerce.number().int().min(1).optional(),
  teamId: z.string().optional(),
  status: z.enum(TEAM_MATCH_STATUSES).optional(),
  sort: z.enum(TEAM_MATCH_SORTS).default('week_no'),
});

type TeamMatchQuery = z.infer<typeof teamMatchQuerySchema>;

const readTeamMatchQuery = (url: URL): TeamMatchQuery | null => {
  const parsed = teamMatchQuerySchema.safeParse({
    sessionId: url.searchParams.get('session_id') ?? undefined,
    divisionId: url.searchParams.get('division_id') ?? undefined,
    weekNo: url.searchParams.get('week_no') ?? undefined,
    teamId: url.searchParams.get('team_id') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
  });

  // An unscoped list would be every night in every league: one of the two is required.
  if (!parsed.success || (!parsed.data.sessionId && !parsed.data.divisionId)) {
    return null;
  }

  return parsed.data;
};

const compareTeamMatches = (a: TeamMatchRow, b: TeamMatchRow, field: string): number => {
  if (field === 'week_no' && a.weekNo !== b.weekNo) {
    return a.weekNo - b.weekNo;
  }

  return a.scheduledAt.localeCompare(b.scheduledAt);
};

const filterTeamMatches = (store: LeagueStore, query: TeamMatchQuery): TeamMatchRow[] => {
  const scoped = query.sessionId
    ? getSessionTeamMatches(store, query.sessionId)
    : store.teamMatches;
  const direction = query.sort.startsWith('-') ? -1 : 1;
  const field = query.sort.replace(/^-/, '');

  return scoped
    .filter((teamMatch) => !query.divisionId || teamMatch.divisionId === query.divisionId)
    .filter((teamMatch) => !query.weekNo || teamMatch.weekNo === query.weekNo)
    .filter((teamMatch) => !query.status || teamMatch.status === query.status)
    .filter(
      (teamMatch) =>
        !query.teamId ||
        teamMatch.homeTeamId === query.teamId ||
        teamMatch.awayTeamId === query.teamId,
    )
    .sort((a, b) => direction * compareTeamMatches(a, b, field));
};

// The references the database's foreign keys and CHECK (home_team_id <> away_team_id) guard.
const hasValidReferences = (store: LeagueStore, teamMatch: TeamMatchRow): boolean => {
  const isInDivision = (teamId: string): boolean => {
    return store.teams.some(
      (team) => team.id === teamId && team.divisionId === teamMatch.divisionId,
    );
  };
  const isKnownVenue =
    teamMatch.venueId === null || store.venues.some((venue) => venue.id === teamMatch.venueId);

  return (
    teamMatch.homeTeamId !== teamMatch.awayTeamId &&
    isInDivision(teamMatch.homeTeamId) &&
    isInDivision(teamMatch.awayTeamId) &&
    isKnownVenue
  );
};

// Swapping a team out from under players already put up would orphan them, so the mock
// refuses it until those matches are reset.
const changesTeamWithPutUps = (
  store: LeagueStore,
  current: TeamMatchRow,
  next: TeamMatchRow,
): boolean => {
  const night = store.individualMatches.filter((match) => match.teamMatchId === current.id);
  const homeChanged =
    next.homeTeamId !== current.homeTeamId && night.some((match) => match.homePlayerId !== null);
  const awayChanged =
    next.awayTeamId !== current.awayTeamId && night.some((match) => match.awayPlayerId !== null);

  return homeChanged || awayChanged;
};

const findTeamMatch = (teamMatchId: string): TeamMatchRow | undefined => {
  return getLeagueStore().teamMatches.find((teamMatch) => teamMatch.id === teamMatchId);
};

const replaceTeamMatch = (store: LeagueStore, next: TeamMatchRow): LeagueStore => {
  return {
    ...store,
    teamMatches: store.teamMatches.map((teamMatch) =>
      teamMatch.id === next.id ? next : teamMatch,
    ),
  };
};

const TEAM_MATCH_PATH = `${ENDPOINTS.TEAM_MATCHES}/:teamMatchId`;

export const teamMatchHandlers = [
  http.get(apiUrl(ENDPOINTS.TEAM_MATCHES), ({ request }) => {
    const query = readTeamMatchQuery(new URL(request.url));
    if (!query) {
      return validationFailed();
    }

    const store = getLeagueStore();

    return listEnvelope(
      filterTeamMatches(store, query).map((teamMatch) => toAdminTeamMatch(store, teamMatch)),
    );
  }),

  http.get<{ teamMatchId: string }>(apiUrl(TEAM_MATCH_PATH), ({ params }) => {
    const teamMatch = findTeamMatch(params.teamMatchId);

    return teamMatch ? envelope(toAdminTeamMatchDetail(getLeagueStore(), teamMatch)) : notFound();
  }),

  http.post(apiUrl(ENDPOINTS.TEAM_MATCHES), async ({ request }) => {
    const parsed = teamMatchInputSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return validationFailed();
    }

    const teamMatch: TeamMatchRow = {
      ...parsed.data,
      id: createMockId('team-match'),
      venueId: parsed.data.venueId ?? null,
      status: 'scheduled',
      homePoints: 0,
      awayPoints: 0,
    };
    if (!hasValidReferences(getLeagueStore(), teamMatch)) {
      return validationFailed();
    }

    // league-be creates the night's five individual matches with the team match.
    const night = Array.from({ length: MATCHES_PER_NIGHT }, (_, index) => {
      return buildPendingMatch(teamMatch.id, index + 1);
    });
    updateLeagueStore((store) => {
      return {
        ...store,
        teamMatches: [...store.teamMatches, teamMatch],
        individualMatches: [...store.individualMatches, ...night],
      };
    });

    return envelope(toAdminTeamMatchDetail(getLeagueStore(), teamMatch), { status: 201 });
  }),

  http.patch<{ teamMatchId: string }>(apiUrl(TEAM_MATCH_PATH), async ({ params, request }) => {
    const current = findTeamMatch(params.teamMatchId);
    if (!current) {
      return notFound();
    }

    const parsed = teamMatchPatchSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return validationFailed();
    }

    const store = getLeagueStore();
    const { venueId, ...changes } = parsed.data;
    const next: TeamMatchRow = {
      ...current,
      ...changes,
      venueId: venueId === undefined ? current.venueId : venueId,
    };
    if (!hasValidReferences(store, next) || changesTeamWithPutUps(store, current, next)) {
      return validationFailed();
    }

    updateLeagueStore((latest) => {
      return replaceTeamMatch(latest, next);
    });

    return envelope(toAdminTeamMatchDetail(getLeagueStore(), next));
  }),

  http.delete<{ teamMatchId: string }>(apiUrl(TEAM_MATCH_PATH), ({ params }) => {
    if (!findTeamMatch(params.teamMatchId)) {
      return notFound();
    }

    updateLeagueStore((store) => {
      return {
        ...store,
        teamMatches: store.teamMatches.filter((teamMatch) => teamMatch.id !== params.teamMatchId),
        individualMatches: store.individualMatches.filter(
          (match) => match.teamMatchId !== params.teamMatchId,
        ),
      };
    });

    return noContent();
  }),
];
