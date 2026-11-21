# Phase 1 — Contract, client and mocks

**Status: done, 2026-11-20.** See the Outcome section for where the build differs from these tasks.

## Goal

Everything the screens need from the data layer: types, API methods, query factories, mutation
hooks, and an MSW mock store that implements the contract in [plan.md](plan.md). The store runs in
dev behind a flag, and tests use it too.

## Tasks

### Types (`src/types/league.ts`)

- [ ] `SessionType = 'SPRING' | 'SUMMER' | 'FALL'`
- [ ] `SessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED'`
- [ ] `LeagueSession` with the fields `id`, `leagueId`, `name`, `sessionType`, `seasonYear`,
      `startsOn`, `endsOn`, `status`, `isActive`, `createdAt` and `updatedAt`
- [ ] `SessionInput` (create) and `SessionPatch = Partial<SessionInput>`
- [ ] `SessionWeek {weekNo, matchCount, submittedCount, firstScheduledAt}`
- [ ] `SessionFilters {q?, sessionType?, seasonYear?, status?, sort?}`, with a `SessionSort`
      literal union
- [ ] `AdminTeamMatch extends TeamMatchSummary`, adding `division: {id, name}`
- [ ] `AdminTeamMatchDetail extends AdminTeamMatch`, adding `individualMatches: IndividualMatch[]`
- [ ] `TeamMatchInput`, and `TeamMatchPatch = Partial<TeamMatchInput> & {status?}`
- [ ] `TeamMatchFilters {sessionId, weekNo?, divisionId?, teamId?, status?, sort?}`
- [ ] `IndividualMatchPatch`
- [ ] `RosterEntry {playerId, fullName, skillLevel}`
- [ ] Reuse `TeamMatchSummary`, `IndividualMatch`, `TeamRef` and `VenueRef`. Leave `Season` as it is.

### API (`src/api/endpoints.ts`, `src/api/leagueAPI.ts`)

- [ ] Add `SESSIONS: '/api/v1/sessions'` and `VENUES: '/api/v1/venues'` to `ENDPOINTS`.
- [ ] Add these `LeagueAPI` methods:
  - Sessions: `fetchSessions(filters)`, `fetchSession(id)`, `createSession(input)`,
    `updateSession(id, patch)`, `deleteSession(id)`, `fetchSessionWeeks(id)`
  - Lookups: `fetchSessionDivisions(sessionId)`, `fetchTeams(divisionId)` (already exists),
    `fetchRoster(teamId)`, `fetchVenues()`
  - Team matches: `fetchTeamMatches(filters)`, `fetchAdminTeamMatch(id)`,
    `createTeamMatch(input)`, `updateTeamMatch(id, patch)`, `deleteTeamMatch(id)`
  - Individual matches: `updateIndividualMatch(id, patch)`, `resetIndividualMatch(id)`
- [ ] Each method maps camelCase filters to snake_case params (`session_type`, `season_year`,
      `week_no`, `division_id`, `team_id`) and unwraps `data`. This follows `fetchDivisions`.

### Query factories (`src/queries/league.ts`)

- [ ] Create `leagueQueries` with `sessions(filters)`, `session(id)`, `sessionWeeks(id)`,
      `teamMatches(filters)`, `teamMatch(id)`, `divisions(sessionId)`, `teams(divisionId)`,
      `roster(teamId)` and `venues()`.
- [ ] Use hierarchical keys so invalidation can work by prefix:
  - `['sessions', 'list', filters]` and `['sessions', 'detail', id]`
  - `['sessions', 'detail', id, 'weeks']`
  - `['team-matches', 'list', filters]` and `['team-matches', 'detail', id]`
- [ ] Add list-root helpers such as `leagueQueries.sessionLists()`. A mutation invalidates every
      filtered list through `queryKey`, never through a retyped array (`.claude/rules/react.md`).

### Mutation hooks

All of them are `const` arrows typed `UseMutationResult<T, ApiRequestError, V>`, following
`src/hooks/useMemberLink.ts`.

- [ ] `src/hooks/useSessionMutations.ts` has `useCreateSession`, `useUpdateSession` and
      `useDeleteSession`.
  - They invalidate the session lists.
  - Update also invalidates the session detail.
  - Delete removes the detail query.
- [ ] `src/hooks/useMatchMutations.ts` has `useCreateTeamMatch`, `useUpdateTeamMatch`,
      `useDeleteTeamMatch`, `useUpdateIndividualMatch` and `useResetIndividualMatch`.
  - They invalidate the team-match lists and that session's weeks.
  - The individual-match hooks also invalidate the parent team-match detail, because the
    points roll up.
- [ ] `src/hooks/useLeagueQueries.ts` (or one hook per query) wraps `useQuery(leagueQueries.*)`.

### Mocks (`src/mocks/`)

- [ ] `src/mocks/http.ts`: move `apiUrl`, `envelope` and `apiError` here from `src/test/handlers.ts`,
      and re-export them from that file so existing tests still compile.
- [ ] `src/mocks/db.ts`: an in-memory store with `reset()` for tests. Seed it with:
  - 1 league and 3 sessions: Spring 2026 (COMPLETE), Summer 2026 (COMPLETE) and Fall 2026
    (IN_PROGRESS, active)
  - 2 divisions per session and 4 teams per division, each team with 6 players
  - 2 venues
  - 10 weeks of round-robin matches. Past weeks are `submitted` with complete individual
    matches; the current week is `in_progress`; later weeks are `scheduled`.
- [ ] `src/mocks/rules.ts` mirrors the league-be trigger logic in the mock only:
  - a race lookup (copy the 8-ball race chart rows from the league-be seed)
  - points (3/0, 2/1, 2/0)
  - the roll-up of team-match points
  - Reuse `_parked/src/lib/rules.ts` if it already has these.
- [ ] `src/mocks/handlers/sessions.ts`, `lookups.ts`, `teamMatches.ts` and `individualMatches.ts`:
  - Handle filter and sort as in the contract.
  - Validate and return `apiError(400, '40001')` or `apiError(409, '40901')`.
  - Return 204 on delete, and cascade deletes.
- [ ] `src/mocks/handlers/index.ts` exports `leagueHandlers`. `src/mocks/browser.ts` calls
      `setupWorker(...leagueHandlers, meHandler(SUPER_ADMIN…))`.

### Dev wiring

- [ ] Run `pnpm dlx msw init public --save`.
- [ ] In `src/main.tsx`, when `import.meta.env.DEV && import.meta.env.VITE_API_MOCKS === 'true'`,
      dynamically `import('./mocks/browser')` and `await worker.start({ onUnhandledRequest: 'bypass' })`
      before rendering. Skip `registerSW` in that mode.
- [ ] Add `VITE_API_MOCKS` to `.env.example` and to the type in `src/vite-env.d.ts`.

### Fixtures and errors

- [ ] Add `session.create|read|update|delete` to `SUPER_ADMIN_PERMISSIONS` in `src/test/handlers.ts`.
- [ ] Check that `ERROR_CODE.CONFLICT = '40901'` has en and vi copy under `apiError.40901`, and add it
      if it is missing.

## Implementation notes

- **The dynamic import keeps MSW out of the production bundle.** Vite drops the branch because
  `import.meta.env.DEV` is false at build time.
- **The PWA service worker and the MSW worker conflict on scope**, which is why `registerSW` is
  skipped in mock mode.
- **The mock is a contract, not a toy.** Every validation rule listed in the contract table is
  implemented, so error UI gets exercised in dev.
- **Tests call `db.reset()` in `beforeEach`.** Add it to `src/test/setup.ts`, and register
  `leagueHandlers` in `src/test/server.ts` next to the existing defaults.

## Verify

- `pnpm typecheck` passes with the new types, and the old `Season` users still compile.
- Unit tests for `src/mocks/rules.ts`:
  - points for a 3–0, 3–2 hill and 3–1 result
  - the race lookup is symmetric
- Unit tests for handler filter and sort:
  - `GET /sessions?q=spr` → Spring 2026
  - `sort=name` → Fall, Spring, Summer
  - `GET /team-matches?team_id=X` → only matches where X plays home or away
- `VITE_API_MOCKS=true pnpm dev`: the Network tab shows `[MSW]` responses, and
  `pnpm build && pnpm preview` shows no MSW in the bundle (`grep -r setupWorker dist/` is empty).

## Outcome, 2026-11-20

### Files

- Types: `src/types/league.ts` (session, week, admin team match, inputs and filters) and
  `src/types/errors.ts` (`CONFLICT: '40901'`, with en and vi copy).
- API: `src/api/endpoints.ts` (`SESSIONS`, `VENUES`) and **`src/api/leagueAdminAPI.ts`**.
- Queries and hooks: `src/queries/league.ts`, `src/hooks/useLeagueQueries.ts`,
  `src/hooks/useSessionMutations.ts` and `src/hooks/useMatchMutations.ts`.
- Rules: `src/lib/rules.ts` and its test, un-parked from `_parked/src/lib/`.
- Mocks in `src/test/mocks/`:
  - `http.ts`
  - `league-store.ts`, `league-seed.ts`, `league-night.ts`, `league-views.ts`
  - `score-individual-match.ts`
  - `handlers/{sessions,lookups,team-matches,individual-matches,index}.ts`, with tests
  - `browser.ts`
- Wiring:
  - `src/test/server.ts` and `src/test/setup.ts` (`resetLeagueStore()` runs before each test)
  - `src/main.tsx`, `src/vite-env.d.ts`, `.env.example`
  - `public/mockServiceWorker.js` and `package.json` `msw.workerDirectory`
  - The worker is excluded from ESLint and Prettier.

### Decisions

- **The admin methods live in `LeagueAdminAPI`, not `LeagueAPI`.** Adding them to `LeagueAPI`
  would have pushed it past the 300-line lint cap. `fetchTeams` stays on `LeagueAPI` and is reused.
- **The mocks live in `src/test/mocks/`, not `src/mocks/`.** The clean-code rule says MSW handlers
  live in `src/test/`. `src/test/handlers.ts` re-exports `apiUrl`, `envelope` and `apiError`.
- **`rules.ts` was un-parked**, so the mock and Phase 4's race preview share one copy of the race
  chart and points rule. `pointsFor` now takes one `GameScore` object, because of `max-params`.
  `_parked/RESTORE.md` and the parked `ResultPage` are updated to match.
- **`registerSW` needed no change.** It already runs only in production, and the worker only in dev.
- **The MSW 3 option is `onUnhandledFrame`.** `onUnhandledRequest` no longer exists.
- **Mock-only rules, to confirm with league-be:**
  - Changing a team on a night that already has put-ups is refused (40001).
  - An individual match's `status` is derived from the score, and a contradicting `status` is
    refused.
  - `GET /team-matches` needs `session_id` or `division_id`.

### Verify — passing

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass: 19 files, 126 tests.
- New handler tests go through the real axios client. They cover filter and sort, 409 and 400
  errors, cascading deletes, the week summary, team-match creation with five pending matches,
  put-up snapshots, scoring and the roll-up, the one-match-per-night rule, and reset.
- `VITE_API_URL=… pnpm build` contains no MSW code. `grep setupWorker dist/assets` finds nothing.
- `VITE_API_MOCKS=true` dev server: the worker script and the mock modules are served with no
  transform errors.

### Not verified

- I did not open the app in a browser with `VITE_API_MOCKS=true`. No screen uses these hooks
  until Phase 2.
- `dist/mockServiceWorker.js` ships, because Vite copies everything in `public/`. Nothing
  registers it in production.

## Changes after review, 2026-11-21

- **All of `src/components/ui` is stock shadcn again.** It was regenerated with
  `--overwrite`, and only the colour tokens in `src/index.css` are customised.
  - `--radius` is back to `0.625rem`, and the global `:focus-visible` outline is gone.
  - Callers moved to stock variants: `size="lg"` and `icon-lg`, the badge `secondary` variant with
    a colour from `src/lib/status-colors.ts`, and the alert `destructive` variant.
- **The session form uses react-hook-form with Zod and the shadcn `field` primitives**
  (`SessionForm` and `SessionFormFields`).
  - `FormField.tsx` and `src/lib/form-field.ts` were removed.
  - `src/lib/session-form.ts` now exports `sessionFormSchema`, whose messages are i18n keys.
- **The tests added in Phases 1 and 2 were removed**, at the user's request: the mock-handler,
  lib-helper and page tests, plus their jsdom stubs. New tests are written only when asked for.
- **The sessions screen needs `VITE_API_MOCKS=true`.** Without it, `/api/v1/sessions` reaches
  league-be, which has no such route. Its plain-text 404 has no error code, so the screen shows the
  generic error.

## Mock sessions from JSON, 2026-11-22

- **The JSON file:** `src/test/mocks/data/sessions.json` is a literal `GET /api/v1/sessions`
  response.
  - It has the envelope (`session_id`, `count`, `data`) and UUID ids like league-be's tables.
  - The fields are camelCase and include `weekCount` and `hasSubmittedResults`.
  - It doubles as the contract sample for the backend.
- **The seed:** `league-seed.ts` validates the file with Zod, seeds the store's sessions from
  `data`, and generates `weekCount` weeks of matches for each one.
  - Complete and cancelled sessions have every week submitted, and drafts none.
  - An in-progress session has every night before today submitted, so the current week shows as
    in progress.
- **Dev only:** `pnpm dev` starts the MSW worker by default, with **only the session routes**
  (`src/test/mocks/browser.ts`). Sign-in, `/me` and everything else go to the real league-be.
  `VITE_API_MOCKS=false` turns the mock off.
- **Tests:** still register every league handler.
- **When league-be ships `/api/v1/sessions`:** set `VITE_API_MOCKS=false` (or delete the worker
  start in `src/main.tsx`). Nothing in `src/api`, `src/queries` or the screens changes.
