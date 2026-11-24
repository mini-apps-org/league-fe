# Phase 4 — Team match detail: individual matches (`/admin/sessions/:sessionId/matches/:matchId`)

**Status: planned, 2026-11-20.** Depends on Phases 1 and 3.

## Goal

Selecting a team match lists its 5 individual matches. The super admin can set or change the
players, scores, innings, defensive shots and status of each one, or reset one to pending. Points
always come from the server.

## Tasks

### Page: `src/pages/admin/sessions/TeamMatchDetailPage.tsx`

- [ ] Read `sessionId` and `matchId`, and load `leagueQueries.teamMatch(matchId)`, which includes
      `individualMatches`. If the match's division doesn't belong to `sessionId`, treat it as
      not found.
- [ ] Breadcrumb: Sessions › {session name} › W{n} {Home} vs {Away}. The session link returns to
      `ADMIN_SESSION?week={n}`.
- [ ] Header:
  - Home vs Away, with the team score `homePoints–awayPoints` large in between
  - week, date and time, venue, division, and a status badge
  - Edit and Delete actions that reuse the Phase 3 drawers. After a delete, navigate to the
    session page.
- [ ] Individual matches:
  - At 1024px and up, a `Table` sorted by `matchOrder` with the columns **# · Put up first ·
    Home player (SL · race) · Games · Away player (SL · race) · Innings · Def. shots (H/A) ·
    Points (H–A) · Status · actions**.
  - Below 1024px, reuse `ScoresheetRow` (`src/components/league/ScoresheetRow.tsx`) and
    `SkillLevelSquare`.
  - An empty player slot shows "Not put up".
  - Every row shows, even pending ones, so all five are always visible (R-003).
- [ ] Row actions:
  - Edit, gated by `match.update`.
  - Reset, gated by `match.update`, because the backend maps DELETE on this resource to the
    match feature. It is disabled when the row is already pending with no players.

### Edit drawer: `src/pages/admin/sessions/IndividualMatchDrawer.tsx`

- [ ] Rosters: load `leagueQueries.roster(homeTeamId)` and `.roster(awayTeamId)`.
- [ ] Fields:
  - Home player and away player: a `Select` from each roster, showing "Name · SL n".
  - A player already used in another match of the same night is listed but disabled, with a
    `ReasonChip` reading "Already played" (R-036).
  - Race: read-only. It shows the snapshot when one exists. Before the snapshot, it shows a
    preview from the race chart, labelled "preview".
  - Home games and away games: number inputs from 0 to the race.
  - Innings: optional, at least 0.
  - Home and away defensive shots: at least 0.
  - Status: pending or complete.
- [ ] `individualMatchSchema` in `src/lib/individual-match-form.ts`, used through `zodResolver`:
  - all counts are non-negative integers
  - games can't exceed the race on either side
  - when the status is `complete`, exactly one side has reached its race
  - both players are required when the status is `complete`
- [ ] Submit sends a PATCH with only the changed fields. On success, show a toast. The hook
      invalidates the team-match detail, so the updated points and team score show up, along with
      the lists and weeks.
- [ ] Server 400001 errors (rule violations) show in an `Alert` through `messageFor`.

### Reset drawer: `ResetIndividualMatchDrawer.tsx`

- [ ] The copy reads: "Reset match {n}? Players, scores and points are cleared and it goes back to
      pending." It sends a DELETE.

### i18n

- [ ] `admin.individualMatches.*`: `title`, `columns.*`, `notPutUp`, `racePreview`,
      `alreadyPlayed`, `status.pending|complete`, `form.*`, `reset.*`, `toast.*` and
      `validation.*`. Mirror them in vi.

## Implementation notes

- **The race preview is the only rules logic on the frontend**, and it is only for display. Reuse
  the race lookup from `src/mocks/rules.ts` by moving it to `src/lib/rules.ts` if the page needs
  it outside the mocks. Snapshots are never edited on the frontend.
- **Super admins can edit submitted nights.** The design allows this (FR-14.8). Editing a
  `submitted` match shows a warn `Alert`: "This night is submitted. Changes re-score it." See open
  question 6 in plan.md.
- **There is no separate "create individual match" action.** The five rows exist from the moment
  the team match is created.

## Verify

Check by hand, with `VITE_API_MOCKS=true pnpm dev`. No new tests unless asked for:

- [ ] Five rows render in order for a seeded in-progress match, and the pending rows show
      "Not put up".
- [ ] Setting both players and 3–2 with race 3/3 sends a PATCH. The row then shows 2–1 points from
      the mock, and the header team score updates.
- [ ] Entering games above the race shows a field error, and no request is sent.
- [ ] Completing a match with neither side at its race is blocked.
- [ ] A player used in match 1 is disabled in the match 2 selects.
- [ ] Reset sends a DELETE. The row goes back to pending, and the team score drops.
- [ ] A match from another session's URL shows not found.
- [ ] A captain sees `auth.unauthorized`.
- [ ] Manual: run `VITE_API_MOCKS=true pnpm dev` and go sessions → Fall 2026 → W3 → a match →
      edit match 4. Check it on mobile and desktop, in light and dark.
