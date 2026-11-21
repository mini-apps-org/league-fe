# Phase 3 — Session detail: weeks and matches (`/admin/sessions/:sessionId`)

**Status: planned, 2026-11-20.** Depends on Phases 1 and 2.

## Goal

Selecting a session shows every week in it and the team matches of the selected week, or of all
weeks. The super admin can filter by division, team and status, sort, and create, edit and delete
team matches.

## Tasks

### Page: `src/pages/admin/sessions/SessionDetailPage.tsx`

- [ ] Read `sessionId` with `useParams`. Load `leagueQueries.session(id)`, `.sessionWeeks(id)`
      and `.divisions(id)`.
- [ ] Show a back link to `ADMIN_SESSIONS` that keeps the list's search params (pass them through
      `location.state`).
- [ ] Header:
  - name, type and year, the date range, a status badge, and an Active marker
  - Edit and Delete actions that reuse the Phase 2 drawers, gated by `session.update` and
    `session.delete`
- [ ] A 404 (`40401`) renders `EmptyState` with "Session not found" and a link back.

### Weeks strip: `src/pages/admin/sessions/WeekStrip.tsx`

- [ ] Adapt `_parked/src/components/league/WeekChips`. Use `ToggleGroup type="single"` and scroll
      sideways on mobile.
- [ ] Chips:
  - An "All weeks" chip.
  - One chip per `SessionWeek`, labelled `W{weekNo}`, with a `{submittedCount}/{matchCount}`
    sub-label.
  - A chip with every match submitted gets a success tone.
- [ ] Store the selection in `?week=`, where an absent value means all weeks.
- [ ] When `?week` is absent on first load, default to the earliest week that has
      `submittedCount < matchCount` (F11 rule), using `replace` navigation. Fall back to the last
      week. Do this only on first load, so choosing "All weeks" sticks (write `?week=all`).
- [ ] A session with no matches shows an `EmptyState` with "No matches scheduled yet" and a
      "New match" action.

### Match list: `src/pages/admin/sessions/SessionMatchList.tsx`

- [ ] The query is `leagueQueries.teamMatches({sessionId, weekNo, divisionId, teamId, status, sort})`.
- [ ] Filters, each synced to search params:
  - Division `Select` → `?division=`.
  - Team `Select` → `?team=`, filled from `leagueQueries.teams(divisionId)` across the session's
    divisions. When a division is selected, list only that division's teams, and clear `?team`
    if it isn't among them.
  - Status `Select`: all, scheduled, in progress or submitted → `?status=`.
  - Sort `Select`: week ↑ (default), week ↓, date ↑ or date ↓ → `?sort=`.
- [ ] At 1024px and up, a `Table` with the columns **Week · Date & time · Division · Home ·
      Away · Venue · Score · Status · actions**.
  - Score is `homePoints–awayPoints`, and a dash when `scheduled`.
  - When a team filter is set, highlight that team's name.
- [ ] Below 1024px, reuse the `FixtureCard` layout (`src/components/league/FixtureCard.tsx`) and add
      a division label.
- [ ] Clicking a row navigates to `ADMIN_SESSION_MATCH`. The actions menu (Edit, Delete) is gated
      by `match.update` and `match.delete`.
- [ ] A "New match" button is gated by `match.create`. When a week is selected, it prefills `weekNo`.

### Form: `src/pages/admin/sessions/TeamMatchFormDrawer.tsx`

- [ ] A create or edit `Drawer`. Fields:
  - Division (`Select`, disabled in edit mode)
  - Week number (`Input type=number`, at least 1)
  - Home team and away team (`Select` from the chosen division; the away list excludes the home
    team)
  - Venue (`Select`, optional; defaults to the home team's venue if `TeamRef` carries it)
  - Date and time (`Input type=datetime-local`, converted to ISO with the league timezone; see the
    notes)
  - Status (edit mode only)
- [ ] `teamMatchSchema` in `src/lib/team-match-form.ts`, used through `zodResolver`, requires the division and both teams, home ≠ away,
      `weekNo` as an integer of at least 1, and a valid date.
- [ ] Server errors show in an `Alert` through `messageFor`. On success, show a toast and
      invalidate the lists and weeks (the Phase 1 hooks do this).

### Delete: `DeleteTeamMatchDrawer.tsx`

- [ ] The copy reads: "Delete W{n} {Home} vs {Away}? Its 5 individual matches and scores are
      deleted too." When the status is `submitted`, add a warning line.

### i18n

- [ ] `admin.matches.*`: `title`, `new`, `allWeeks`, `week`, `filters.*`, `sort.*`, `columns.*`,
      `status.scheduled|in_progress|submitted`, `form.*`, `delete.*`, `toast.*`, `empty.*`. Mirror
      them in vi.

## Implementation notes

- **Weeks come from the server** (`/sessions/{id}/weeks`), not from the match list, so the strip
  stays complete while the list is filtered.
- **Timezone:** `scheduled_at` is TIMESTAMPTZ and `leagues.timezone` exists.
  - For now, display and edit in the browser's local time with `src/lib/format.ts`.
  - If the league timezone turns out to matter, add it to `LeagueSession` (open question 2 in
    plan.md).
- **"Filter by team" means home or away.** The mock implements this, and the contract asks the
  backend for the same.
- **Search params are written with `setSearchParams(prev => …)`**, so changing one filter doesn't
  wipe the others. Changing the week leaves the other filters as they are.

## Verify

Check by hand with `pnpm dev`. First add the lookup and team-match handlers to `src/test/mocks/browser.ts`, which serves only the session routes today. No new tests unless asked for:

- [ ] Opening Fall 2026 with no `?week` selects the first week that isn't fully submitted, and the
      URL updates with `replace`.
- [ ] Clicking W2 lists only week-2 matches. "All weeks" lists all of them, sorted by week.
- [ ] A team filter shows only matches where the team is home **or** away, and the request carries
      `team_id`.
- [ ] Changing the division clears a team that isn't in that division.
- [ ] Creating a match posts the right body. The week chip count goes up by one after invalidation.
- [ ] Home = away blocks submit on the client. A forced server 40001 shows `messageFor` copy.
- [ ] Delete removes the row, and the week's count goes down.
- [ ] An unknown `sessionId` shows "Session not found".
- [ ] A captain sees `auth.unauthorized`.
