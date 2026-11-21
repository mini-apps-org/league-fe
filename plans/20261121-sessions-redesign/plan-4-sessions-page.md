# Phase 4 — Sessions page

**Status: done, 2026-11-21.** See the Outcome section for where the build differs from these tasks.

## Goal

`/admin/sessions` matches the design's list and every one of its states, on desktop and mobile.

## Tasks

### Data

- [ ] `src/types/league.ts`: add `weekCount: number` and `hasSubmittedResults: boolean` to
      `LeagueSession`. Add both to the contract table in
      `plans/20261120-session-match-crud/plan.md`.
- [ ] `src/test/mocks/league-views.ts`:
  - New `toSessionView(store, session)`. It fills `weekCount` from `getSessionWeeks().length`,
    and `hasSubmittedResults` when any of the session's team matches is `submitted`.
  - Use it in every session response in `handlers/sessions.ts`.
- [ ] `handlers/sessions.ts`: a POST or PATCH that sets `isActive: true` sets every other session in
      the league to `isActive: false`.

### Page: `SessionsPage.tsx`

- [ ] Header: `PageTitle` with the description "Seasons of league play. Open a session to manage
      its weeks and team matches.", and a primary `New session` button with a plus icon, at the
      stock default size.
- [ ] New `SessionStats.tsx`: four stock `Card`s in a grid, `grid-cols-2` on mobile and four
      columns from `md`.
  - **Active session:** the session's name, or "None active". It has `border-primary
    bg-primary-soft`, the name in `text-primary`, and spans the full width on mobile.
  - **Total sessions**, **In progress** and **Drafts**, computed from `useSessions(ALL_SESSIONS)`.
  - Hidden in the loading, error and no-sessions states.

### Toolbar

- [ ] `SessionsToolbar.tsx`:
  - One wrapping row: search (`flex-1 basis-64`), then the type, year, status and sort selects.
  - Each select's `aria-label` replaces its visible label, as in the design.
  - Placeholder: "Search sessions by name".
  - On mobile the selects sit two per row.
- [ ] New `SessionFilterChips.tsx`:
  - For each active filter, a chip with the filter's label and a remove button, labelled
    "Remove filter …" for screen readers. The chips are
    `Badge variant="secondary"` + `Button size="icon-xs" variant="ghost"`.
  - A "Clear all" link button at the end.
  - Writes through `useSessionFilters`.
- [ ] Drop the old "Clear filters" button from the toolbar; the chips replace it.

### Table: `SessionTable.tsx`

This replaces `SessionTable` and `SessionCardList`; delete `SessionCardList.tsx` and
`SessionActionsMenu.tsx`.

- [ ] Columns:
  - Name, with `weekCount` weeks scheduled, or "No weeks scheduled", as small muted text
    underneath
  - Type, Year, Dates
  - Status: the Phase 1 badge
  - Active: a primary dot plus "Active", or a muted dash
  - Actions: edit and delete `Button variant="ghost" size="icon"`, labelled with "Edit …" and
    "Delete …", each gated by `PermissionGate`
- [ ] Sortable headers:
  - Name, Year and Dates are `<button>`s inside `TableHead`, with `aria-sort` on the active
    column and an up, down or neutral chevron icon.
  - A click toggles the column's direction and writes `sort` through `useSessionFilters`.
  - Name starts ascending; Year and Dates start descending.
  - Add `season_year` to `SESSION_SORTS` so Year can sort ascending too.
- [ ] Row interaction:
  - Clicking a row navigates to `ADMIN_SESSION`.
  - The name cell is a `Link`, which is the keyboard path.
  - The icon buttons call `stopPropagation`.
  - `TableHead` has a `bg-muted` header row.
- [ ] Mobile, below `md`, using layout utilities on the table elements:
  - `thead` hidden.
  - Each row is `grid grid-cols-[1fr_auto]`.
  - Type and Year are hidden.
  - Status sits top right; the actions span rows 2–3 on the right.
- [ ] Footer: "Showing X of Y sessions", plus "Click a row to open its weeks" from `md` up.

### States

All render inside the same bordered card.

- [ ] **Loading:** the table header plus five rows of `Skeleton` cells at the design's widths.
- [ ] **Error:**
  - A destructive-soft icon tile with `TriangleAlert`.
  - The title "We couldn't load sessions" and `messageFor(error)`.
  - A `font-mono` chip with `error.code`.
  - An outline "Try again" button that calls `refetch`.
- [ ] **No sessions:** a highlight-soft icon tile with `CalendarRange`, the design's copy, and the
      primary `New session` button.
- [ ] **No results:** a muted tile with a `Filter` icon, "No sessions match these filters",
      "Try a different name, or clear the filters to see all N sessions.", and an outline "Clear
      filters" button.
- [ ] Add a local `ListState` helper with icon, tone, title, body and action props, shared by
      the four states. Retire `EmptyState`'s use on this page.
- [ ] i18n: all new copy in en and vi under `admin.sessions.*`. Delete the keys that are no longer
      used (`listLabel`, `actionsFor`) from both files.

## Verify

Run `pnpm dev` and open `/admin/sessions`. Compare against the artifact's
preview bar:

- **List:** stats, chips after filtering, header sorting reflected in the URL and the sort
  select, the row click, and the footer count.
- **Loading:** throttle the network in devtools.
- **No results:** `?q=winter`.
- **No sessions:** delete all four sessions.
- **Error:** turn the mock flag off.
- **Mobile:** at 375px the rows become two-column grids, with no horizontal scroll.

## Outcome, 2026-11-21

- **Data:**
  - `LeagueSession` has `weekCount` and `hasSubmittedResults`.
  - The mock stores a `SessionRow` without those two fields and derives them in
    `toSessionView`.
  - A POST or PATCH with `isActive: true` deactivates the league's other sessions, through
    `saveSession`.
  - The contract in the CRUD plan records both changes.
- **Page:**
  - `SessionsPage` has a header with a description, `SessionStats`, `SessionsToolbar` (select
    `aria-label`s and no visible labels, disabled while loading, on error or with no sessions),
    and `SessionFilterChips`.
  - One bordered card holds the list or a state.
- **Table:**
  - `SessionTable` is one responsive table, with sortable Name, Year and Dates (`aria-sort`).
    The new helpers `getColumnSortDirection` and `getNextColumnSort` drive them, and ascending
    year was added to `SESSION_SORTS`.
  - Rows open the session on click; the name stays a `Link`.
  - The edit and delete icon buttons are behind `PermissionGate`.
  - Below `md` the table turns into a two-column grid of stacked rows.
  - A footer shows the count.
- **States:**
  - `SessionTableSkeleton` shows five rows while loading.
  - The error, no-sessions and no-results states reuse `StateCard` (`bordered={false}`).
  - The error state shows the code in `ErrorCodeChip`.
- **Removed:** `SessionCardList.tsx` and `SessionActionsMenu.tsx`, plus the `Ellipsis` and
  `SearchX` icons.
- **Copy:** `admin.sessions.*` was rewritten in en and vi, and keys nothing uses were dropped.
- **Checks:** lint, typecheck, `pnpm test` (104) and the build pass.
- **Not verified:** I didn't check it in a browser.
