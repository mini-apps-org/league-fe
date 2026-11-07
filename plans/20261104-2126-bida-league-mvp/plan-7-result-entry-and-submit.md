# Phase 7 — Result entry, night summary and submit

**Status: done, 2026-11-06.** `/matches/:id/result/:order` with race-capped steppers, a live
verdict from `rules.ts`, Zod validation gating the save button, the night scoresheet, and
submit confirmed in a bottom sheet (not a dialog — a project rule). Desktop scoresheet layout
is the one piece deferred; the mobile flow is complete.

## Goal
A captain enters the five results and submits the night, seeing the team score before and
after.

## Tasks
- [ ] `/matches/[id]/result/[order]` — +/- steppers for each player's games won, capped at
      that player's race; steppers for innings and per-player defensive shots.
- [ ] A Zod schema for the result payload — both games within `0..race`, innings and
      defensive shots non-negative integers — parsed before the `PUT` and used to drive the
      save button's disabled state.
- [ ] Live verdict and points preview from `rules.ts` as the numbers change.
- [ ] Save → `PUT /api/v1/individual-matches/{id}/result`, then route to the next put-up, or
      to the night summary after match 5.
- [ ] Night summary: all 5 matches with their results and the team score (e.g. "3–2").
- [ ] Submit after match 5 → `POST /api/v1/team-matches/{id}/submit`. Confirm in a dialog, not
      `window.confirm`.
- [ ] After submit, the night is read-only for a captain; an admin still sees editable
      controls.
- [ ] Desktop `/matches/[id]`: the whole night as one scoresheet table (5 rows), with inline
      entry for the current match and the put-up panel beside it.

## Implementation notes

**Layout, copy and states are specified in `ui-spec.md` → Screens** — element anatomy, both
breakpoints, every empty/loading/error/role variant, and the exact copy strings. Build against
it rather than re-deciding here; where it disagrees with the artboards, the artboards win and
the spec gets corrected.

**Cap the stepper at the race, and only at the race.** A player racing to 3 cannot win 4
games. Both players reaching their race at once is impossible and should be unreachable
through the UI, not merely rejected on save.

**The preview is local; the truth is the response.** Show `rules.ts`'s verdict while the
captain adjusts, then render the points from the `PUT` response. The triggers are
authoritative, and the response is where a disagreement becomes visible.

**Innings is per match, defensive shots are per player.** The schema has one `innings` column
and `home_def_shots` / `away_def_shots`. Getting this backwards is easy and silently wrong.

**Submit is a one-way door for the captain.** Hence the confirmation dialog, and hence the
read-only state afterwards — but admins must still be able to correct, so the read-only
decision is role-dependent, not status-dependent alone.

**No live scoring.** Entry happens once per match, after it is played. Do not add per-rack
controls.

## Verify
- A stepper for a player racing to 3 stops at 3 and its + button is disabled, not just
  ignored.
- Entering 3–0 shows a 3/0 preview, and the saved response returns `home_points: 3`.
- Entering 5–2 where the winner races 5 shows and saves 2/0.
- After five saves, the summary shows a team score whose halves sum to 15 (5 matches × 3
  points).
- The summary's team score matches `team_matches.home_points`/`away_points` in the database.
- Submit asks for confirmation; cancelling changes nothing.
- After submit, a captain sees no editable control; an admin on the same night does.
- At 1024px the scoresheet table shows all 5 rows with the put-up panel beside it; at 390px
  it is the single-match flow.
