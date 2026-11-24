import type { SessionFilters, SessionSort, SessionStatus, SessionType } from '@/types/league';

export const SESSION_TYPES: readonly SessionType[] = ['SPRING', 'SUMMER', 'FALL'];

export const SESSION_STATUSES: readonly SessionStatus[] = [
  'DRAFT',
  'IN_PROGRESS',
  'COMPLETE',
  'CANCELLED',
];

// The sorts the screen offers, in menu order.
export const SESSION_SORTS = [
  '-starts_on',
  'starts_on',
  'name',
  '-name',
  '-season_year',
  'season_year',
] as const satisfies readonly SessionSort[];

export type SessionSortOption = (typeof SESSION_SORTS)[number];

export const DEFAULT_SESSION_SORT: SessionSortOption = '-starts_on';

// Every session in the default order: the year options are built from this list, and on a
// fresh visit it is the same query the page itself makes, so it costs no second request.
export const ALL_SESSIONS: SessionFilters = { sort: DEFAULT_SESSION_SORT };

const PARAM = {
  q: 'q',
  sessionType: 'type',
  seasonYear: 'year',
  status: 'status',
  sort: 'sort',
} as const;

const pickAllowed = <T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | undefined => {
  return allowed.find((candidate) => candidate === value);
};

const parseYear = (value: string | null): number | undefined => {
  if (value === null || !/^\d{4}$/.test(value)) {
    return undefined;
  }

  return Number(value);
};

// A hand-edited URL must not reach the API as an invalid filter, so unknown values are dropped.
export const parseSessionFilters = (params: URLSearchParams): SessionFilters => {
  const q = params.get(PARAM.q)?.trim();

  return {
    q: q === '' ? undefined : q,
    sessionType: pickAllowed(params.get(PARAM.sessionType), SESSION_TYPES),
    seasonYear: parseYear(params.get(PARAM.seasonYear)),
    status: pickAllowed(params.get(PARAM.status), SESSION_STATUSES),
    sort: pickAllowed(params.get(PARAM.sort), SESSION_SORTS) ?? DEFAULT_SESSION_SORT,
  };
};

// Leaves params this screen does not own untouched, and keeps the default sort out of the URL.
export const writeSessionFilters = (
  params: URLSearchParams,
  changes: Partial<SessionFilters>,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  const merged = { ...parseSessionFilters(params), ...changes };
  const values: Record<keyof typeof PARAM, string | undefined> = {
    q: merged.q,
    sessionType: merged.sessionType,
    seasonYear: merged.seasonYear === undefined ? undefined : String(merged.seasonYear),
    status: merged.status,
    sort: merged.sort === DEFAULT_SESSION_SORT ? undefined : merged.sort,
  };

  (Object.keys(PARAM) as (keyof typeof PARAM)[]).forEach((key) => {
    const value = values[key];
    if (value === undefined || value === '') {
      next.delete(PARAM[key]);
    } else {
      next.set(PARAM[key], value);
    }
  });

  return next;
};

// Sort is a view choice, not a filter: an empty list under a non-default sort is still "no
// sessions at all".
export const hasSessionFilters = (filters: SessionFilters): boolean => {
  return (
    filters.q !== undefined ||
    filters.sessionType !== undefined ||
    filters.seasonYear !== undefined ||
    filters.status !== undefined
  );
};

export const getSeasonYears = (sessions: readonly { seasonYear: number }[]): number[] => {
  return [...new Set(sessions.map((session) => session.seasonYear))].sort((a, b) => b - a);
};

// The table columns that sort, by the API field they sort on.
export type SessionSortColumn = 'name' | 'season_year' | 'starts_on';

export const getColumnSortDirection = (
  sort: SessionSortOption,
  column: SessionSortColumn,
): 'ascending' | 'descending' | undefined => {
  if (sort.replace(/^-/, '') !== column) {
    return undefined;
  }

  return sort.startsWith('-') ? 'descending' : 'ascending';
};

// A click on the sorted column flips it. Another column starts where people expect: names
// A–Z, years and dates newest first.
export const getNextColumnSort = (
  sort: SessionSortOption,
  column: SessionSortColumn,
): SessionSortOption => {
  const direction = getColumnSortDirection(sort, column);
  if (direction === 'ascending') {
    return `-${column}`;
  }
  if (direction === 'descending') {
    return column;
  }

  return column === 'name' ? 'name' : `-${column}`;
};
