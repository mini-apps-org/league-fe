# Phase 5 — Generated types, the rules mirror, and the two read-only screens

**Status: screens done, 2026-11-06. Types still hand-written.** `rules.ts` + 42 tests,
Schedule and Match (roster) screens, shared components, and 117 i18n keys in `en`/`vi`.
`openapi-typescript` could not run — phase 3 has not written the endpoints, so swagger has
only the five auth paths. The contract lives in `src/types/league.ts`, marked TEMPORARY:
generate from swagger and delete that file once phase 3 lands.

## Goal
A signed-in user can browse the schedule and open a fixture to see both rosters with real
stats.

## Tasks
- [ ] `openapi-typescript` from `league-be/docs/swagger/swagger.json` into
      `src/lib/api.types.ts`, wired to a `pnpm gen:api` script. Do not hand-maintain response
      types.
- [ ] `src/lib/rules.ts` — pure functions: `raceFor(slA, slB)` returning both races, and
      `pointsFor(homeGames, awayGames, homeRace, awayRace)`.
- [ ] `src/lib/rules.test.ts` — SL6 v SL6 → 5–5; SL4 v SL5 → 3–4; 3–0 → 3/0; 5–2 → 2/0; plus
      the hill case once Open question 3 is settled. Assert every branch totals 3 points.
- [ ] `/` Schedule — session select, week chips, fixture cards: home vs away with team
      numbers, venue, date/time, status.
- [ ] `/matches/[id]` Team roster — Home/Away tabs; table of name + `member_id`, SL, MW/MP,
      points; "Start match" button; "Add paid member" (captain only).
- [ ] Desktop ≥1024px: schedule list on the left, both rosters side by side on the right.
- [ ] Loading skeletons and empty states for both screens (a week with no fixtures; a team
      with an empty roster).

## Implementation notes

**Layout, copy and states are specified in `ui-spec.md` → Screens** — element anatomy, both
breakpoints, every empty/loading/error/role variant, and the exact copy strings. Build against
it rather than re-deciding here; where it disagrees with the artboards, the artboards win and
the spec gets corrected.

**The race chart is mirrored, not re-derived.** Copy the 36 rows from
`db/migrations/00001_init.sql` into a lookup in `rules.ts`. Deriving races from a formula is
how the mirror drifts from the DB — the chart is data, and the symmetry property
(`(a,b) → (x,y)` implies `(b,a) → (y,x)`) is worth asserting in a test rather than relying on.

**`rules.ts` is for preview only.** It renders a race badge before an
`individual_matches` row exists. Once the row is saved, display the server's `home_race` /
`home_points`, never the local computation. If the two ever disagree the server is right and
the test suite is the bug report.

**MW/MP and points come from `player_division_stats`**, joined server-side in phase 3. Do not
compute them in the client from the matches list — the view is the definition.

**Tabs, not a dropdown, for Home/Away** per the design, with `role="tab"` and
`aria-selected`. The roster table needs real table semantics (`role` is implicit on `<table>`)
plus `aria-sort` if a column is sortable.

## Verify
- `pnpm gen:api` regenerates types with no diff when the spec is unchanged.
- `pnpm test` — `rules.ts` passes every vector, including the symmetry assertion and the
  points-total-3 assertion.
- `/` lists the seeded week-10 fixtures for "8-Ball Open"; switching week chips changes them.
- A week with no fixtures shows the empty state, not a blank page or a spinner.
- `/matches/[id]` shows both rosters; a player with no matches yet shows 0 MW/0 MP rather than
  blank or `NaN`.
- "Add paid member" is absent for a `player` role and present for that night's captain.
- At 1024px the two-column desktop layout appears; at 390px nothing scrolls horizontally.
