# Phase 2 — Sessions list (`/admin/sessions`)

**Status: done, 2026-11-21**, apart from the manual browser check. See the Outcome section.

## Goal

A super admin sees every session, can search, filter and sort them, and can create, edit and
delete one. Clicking a session opens its detail (Phase 3).

## Tasks

### Routing and nav

- [ ] In `src/utils/constants.ts`:
  - Replace `ADMIN_SEASONS: '/admin/seasons'` with `ADMIN_SESSIONS: '/admin/sessions'`.
  - Add `ADMIN_SESSION: '/admin/sessions/:sessionId'` and
    `ADMIN_SESSION_MATCH: '/admin/sessions/:sessionId/matches/:matchId'`.
  - Update the `NAV_SECTIONS` admin item and its `labelKey` (`nav.sessions`).
- [ ] In `src/router/index.tsx`, inside the existing SUPER_ADMIN `RequireRole` group:
  - Swap `SeasonsPage` for `SessionsPage` with `handle: titled('admin.sessions.title')`.
  - Register the two detail routes, with placeholder pages until Phases 3 and 4.
- [ ] Delete `src/pages/admin/SeasonsPage.tsx`, move the i18n key `admin.seasonsTitle` to
      `admin.sessions.title`, and update `AppNav.test.tsx` if it asserts the label.

### Page: `src/pages/admin/sessions/SessionsPage.tsx`

- [ ] Header: a `PageTitle`, plus a "New session" button (`Button` variant `cta`) wrapped in
      `PermissionGate required="session.create"`.
- [ ] Toolbar in `SessionsToolbar.tsx`:
  - A search `Input`, debounced by 300 ms. Write the debounced value to `?q=`.
  - A type `Select`: all, Spring, Summer or Fall → `?type=`.
  - A year `Select`, built from the distinct `seasonYear` values in the unfiltered list → `?year=`.
  - A status `Select`: all, Draft, In progress, Complete or Cancelled → `?status=`.
  - A sort `Select`: newest start (default), oldest start, name A–Z, name Z–A or year → `?sort=`.
  - A "Clear filters" button, shown when any param is set.
- [ ] A `useSessionFilters()` hook parses and writes the search params. It drops unknown values,
      so a hand-edited URL can't crash the query.
- [ ] List, from `leagueQueries.sessions(filters)`:
  - At 1024px and up, a `Table` (`pnpm dlx shadcn add table`, then restyle with palette tokens)
    with the columns **Name · Type · Year · Dates · Status · Active · actions**.
  - Below 1024px, one card per session with name, dates, a status badge and an actions menu.
  - Dates use `src/lib/format.ts`, for example "Feb 2 – May 18, 2026".
  - Status uses `Badge` with a `tone` per status.
  - Active shows a check or a dash.
  - Clicking a whole row or card navigates to `ADMIN_SESSION`.
  - The actions `DropdownMenu` (Edit, Delete) stops click propagation, and each item is wrapped in
    its own `PermissionGate`.
- [ ] States:
  - Loading: `Skeleton` rows.
  - Error: `ErrorBanner` with retry.
  - Nothing matches the filters: `EmptyState` with a "Clear filters" action.
  - No sessions at all: `EmptyState` with a "New session" action.

### Form: `src/pages/admin/sessions/SessionFormDrawer.tsx`

- [ ] A `Drawer` in either create or edit mode, with the props `{open, onOpenChange, session?}`.
- [ ] Fields:
  - Type (`Select`) and Year (`Input type=number`).
  - Name. In create mode it fills itself as `"{Type} {Year}"`, for example "Spring 2026", until
    the user edits it.
  - Starts on and Ends on (`Input type=date`).
  - Status (`Select`), defaulting to `DRAFT` on create.
  - Active (`Switch`, or `Toggle` if `switch` isn't added).
- [ ] Add `sessionSchema` to `src/lib/schemas.ts`, a new file in the parked style:
  - `name` is trimmed, 1–80 characters.
  - `seasonYear` is an integer from 2000 to 2100.
  - `endsOn >= startsOn`; on failure the error goes on `endsOn`.
- [ ] Errors:
  - Field errors show under each field.
  - A server 400001 or 409001 shows in an `Alert` at the top of the drawer, using `messageFor(err)`.
- [ ] Submit is disabled while the mutation is pending. On success, close the drawer, show a
      `sonner` toast, and let the lists refresh through invalidation.
- [ ] Edit sends only the changed fields in the PATCH.

### Delete: `src/pages/admin/sessions/DeleteSessionDrawer.tsx`

- [ ] A confirmation drawer with the copy: "Delete {name}? This also deletes its divisions, teams
      and all matches."
- [ ] A destructive button, disabled while pending. On success, close and show a toast. If the user
      came from the detail page, navigate back to the list.

### i18n

- [ ] In `en.json` add `admin.sessions.*`:
  - `title`, `new`, `search`, `filters.*`, `sort.*`, `columns.*`
  - `type.SPRING|SUMMER|FALL`, `status.DRAFT|IN_PROGRESS|COMPLETE|CANCELLED`
  - `form.*`, `delete.*`, `toast.*`, `empty.*`
- [ ] Mirror every key in `vi.json`.

## Implementation notes

- **The URL is the source of truth for filters.** The query key includes the parsed filters, so
  Back and Forward refetch from the cache instantly.
- **Filtering and sorting happen on the server**, even with mocks, so nothing changes when the
  real API lands. The year options are the one exception, derived from an unfiltered
  `sessions({})` query that is cheap and cached.
- **The name autofill stops after the first manual edit.** Track this with a `nameTouched` ref.
  A duplicate name is caught by the server (409), not checked on the client.

## Verify

Tests in `SessionsPage.test.tsx` and `SessionFormDrawer.test.tsx`, using MSW and `renderRoutes`:

- [ ] Renders the 3 seeded sessions, newest start first.
- [ ] Typing "spr" leaves only Spring 2026 after the debounce, and the URL has `?q=spr`.
- [ ] Choosing type Summer, or sort name A–Z, updates the rows and the URL.
- [ ] Loading `?sort=name&type=FALL` directly renders the filtered list.
- [ ] Create "Spring 2027" posts `{name, sessionType:'SPRING', seasonYear:2027, …}` (capture the
      body as in `OnboardingPage.test.tsx`), and the new row appears.
- [ ] An `endsOn` before `startsOn` shows a field error, and no request is sent.
- [ ] `server.use` returning 409 `409001` on POST shows `i18next.t('apiError.409001')`.
- [ ] Edit sends a PATCH with only the changed fields. Delete sends DELETE, and the row disappears.
- [ ] A captain who loads `/admin/sessions` sees `auth.unauthorized`.
- [ ] Manual: check the layout at 375px and 1280px, in light and dark.

## Outcome, 2026-11-21

### Files

- Routing:
  - `src/utils/constants.ts`: `ADMIN_SESSIONS`, `ADMIN_SESSION`, `ADMIN_SESSION_MATCH` and
    `nav.sessions`
  - `src/router/index.tsx`
  - `SeasonsPage.tsx` deleted
- Page, in `src/pages/admin/sessions/`:
  - `SessionsPage`, `SessionsToolbar`, `SessionTable`, `SessionCardList`, `SessionActionsMenu`
  - `SessionForm`, `SessionFormDrawer`, `DeleteSessionDrawer`
  - placeholder `SessionDetailPage` and `TeamMatchDetailPage`, to be built in Phases 3 and 4
- Shared components and hooks:
  - `src/components/FormField.tsx`, `src/components/league/SessionStatusBadge.tsx`
  - `src/hooks/useSessionFilters.ts`, `src/hooks/useDebouncedCallback.ts`
- Pure helpers, each with a test:
  - `src/lib/session-filters.ts`: URL to filters and back
  - `src/lib/session-form.ts`: Zod validation, default name, patch diff
  - `src/lib/form-field.ts`
  - `formatDateRange` in `src/lib/format.ts`
- shadcn: `src/components/ui/table.tsx` and `switch.tsx`, added through the CLI and restyled with
  `border-line`, `bg-sunken` and `bg-sel-row`.
- Icons: `Ellipsis`, `Pencil`, `SearchX` and `Trash2` in `src/lib/icons.ts`.
- i18n: `admin.sessions.*` and `nav.sessions` in en and vi. `admin.seasonsTitle` and `nav.seasons`
  were removed.
- Tests:
  - `SessionsPage.test.tsx`, `SessionFormDrawer.test.tsx`, `DeleteSessionDrawer.test.tsx`
  - shared helpers in `src/test/admin-sessions.tsx`
  - `src/test/setup.ts` now stubs pointer capture, `scrollIntoView` and `ResizeObserver`, which
    Radix Select, vaul and Radix Switch call

### Decisions

- **Form logic is in `src/lib/session-form.ts`, not `src/lib/schemas.ts`.** Restoring `_parked/`
  copies a `src/lib/schemas.ts` over whatever is there.
- **The table and the cards both render, and CSS shows one** (`hidden lg:block` / `lg:hidden`).
  Choosing in JS would flash the wrong layout on first paint. Tests scope their queries to the
  table.
- **Search shows a draft while the user types.** The draft overrides the URL's `q` until the 300 ms
  debounce writes it. This avoids syncing state, so Back and Clear filters show up immediately.
- **Filter changes use `replace` navigation**, so each keystroke or select doesn't add a history
  entry.
- **Session names stay in English** ("Spring 2027"), whatever the UI language. They are league
  data, and match the league-be seed.
- **The year options come from the default-sort list.** On a fresh visit that is the same query as
  the page's own, so it makes no second request.
- **The row-actions dropdown is non-modal.** A modal Radix menu that opens a vaul drawer leaves
  `pointer-events: none` stuck on `<body>`.
- **Without `session.update` or `session.delete`, the actions menu is hidden.** "New session" needs
  `session.create`.

### Verify — passing

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass: 24 files, 158 tests.
- The page tests cover:
  - the list in default order
  - debounced search writing `?q=`
  - sort and type selects updating rows and URL
  - deep links, and the filtered empty state with clear
  - links to the detail page
  - captain refusal, and hidden actions without the permissions
  - the error banner with retry
  - create with the auto-name and the exact POST body
  - the name autofill stopping after a manual edit
  - the end-before-start field error with no request sent
  - the 409 conflict copy
  - edit sending only `{ status }`
  - delete, cancel, and a failed delete
- With `VITE_API_MOCKS=true`, the dev server compiles every new module.

### Not verified

- I didn't drive the screen in a browser: no browser automation was available in this session.
  Still to check by hand, with `VITE_API_MOCKS=true pnpm dev` and `/admin/sessions`:
  - the layout at 375px and 1280px, in light and dark
  - how the drawer scrolls on a short phone screen
  - native date input styling
- `src/docs/authorization.md`, an untracked file I didn't write, still lists `/admin/seasons`
  and `SeasonsPage`.

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
