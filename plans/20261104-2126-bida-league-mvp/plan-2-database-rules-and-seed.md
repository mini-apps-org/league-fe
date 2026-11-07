# Phase 2 — Put the league's business rules in Postgres

**Status: done and verified, 2026-11-06.** Delivered as
`db/migrations/00002_business_rules.sql` (476 lines) and `db/migrations/00003_seed.sql`, both
applied and exercised against a scratch Postgres 18 database.

> This file was rewritten on 2026-11-06. The original was deleted outside this session; rather
> than restore stale text, it is reconstructed from what actually shipped.

## Goal
The 23-Rule, race lookup, points calculation, skill-level history and standings all live in the
database, so the app never computes them and a manual SQL correction yields the same numbers.

## Tasks
- [x] `fn_snapshot_put_up()` — BEFORE INSERT/UPDATE on `individual_matches`: once both players
      are set and `home_skill_level IS NULL`, copy both `players.skill_level` values and look
      up both races from `race_chart`. Snapshots once and never overwrites.
- [x] `fn_score_individual_match()` — BEFORE INSERT/UPDATE: derives `status` and the points
      split from games vs race. Raises if games exceed the race, or if both players reached it.
- [x] `fn_roll_up_team_points()` — AFTER INSERT/UPDATE/DELETE: sums the rows into
      `team_matches.home_points` / `away_points`.
- [x] `put_up_block_reason(team_match_id, side, player_id)` → the reason text or NULL, and
      `can_put_up(...)` → `reason IS NULL`. Covers the 23-Rule, roster membership, a player
      already playing tonight, and a side that already has five.
- [x] `change_skill_level(player_id, new_skill_level, reason, changed_by)` → the history row
      id. Rejects an out-of-range skill level, a blank reason, an unknown player and a no-op
      change.
- [x] `individual_match_sides` view — one row per player appearance, unioning the two sides.
- [x] `fn_recompute_player_stats()` + `trg_40_sync_player_stats` to maintain `players_stats`.
- [x] `player_division_stats` and `team_standings` views.
- [x] Seed: season "Fall 2026", division "8-Ball Open" (cap 23), venue "Saigon Cue Club",
      4 teams, 30 players across them, week 10 fixtures, and two dev identities.
- [x] `make migrate` and `make seed` targets — there was no migration runner at all; migrations
      had been applied by hand.

## Implementation notes

**Deviations from the original plan, all forced by what the schema actually contained:**

- **`players_stats` is a table, not a view.** The original plan expected to create
  `player_division_stats` as a view over `individual_matches`. The table already existed,
  denormalised, with cross-column CHECKs (`matches_won <= matches_played`,
  `shutouts <= matches_won`) that only make sense under trigger maintenance. So it is
  maintained by a **full recompute per affected player**, not a delta — a recompute is
  idempotent and cannot drift, and those CHECKs are what would catch it if it did.
  `player_division_stats` then became a view over `team_rosters` LEFT JOIN `players_stats`,
  which is what makes an unplayed player show zeros instead of vanishing.
- **`individual_match_sides` was added.** Not in the plan, but a match stores two sides on one
  row, so every per-player aggregate would otherwise repeat the same UNION — and "won" would
  be defined once per query instead of once.
- **`team_standings` counts only `submitted` nights.** A scheduled or in-progress night
  contributes nothing, so the table reads 0 across the board until a captain submits.

**Points do NOT always total 3, and the original plan was wrong to assert that they do.** The
prompt's own rule — "3-0 shutout, 2-1 if loser reached the hill, else 2-0" — yields 3, 3 and
**2**. The plain-win branch is the one that totals 2. Any verification asserting a constant 3
would fail against a correct implementation.

**The hill is implemented as `race − 1`, which contradicts one of the prompt's examples.** The
prompt gives "4–2 when loser race 5 = 2/1 (hill)", but a loser racing to 5 who won 2 games is
three short of the hill. Treated as a typo, flagged in the SQL. **The two change sites, if this
is wrong:** the `ELSIF v_loser_games >= v_loser_race - 1` branch of
`fn_score_individual_match()`, and `pointsFor()` in `league-fe/src/lib/rules.ts`. Still
Open question 3.

**Trigger names are numbered because order matters.** Postgres fires same-event triggers in
name order, and `trg_10_snapshot_put_up` must write `home_race` before
`trg_20_score_individual_match` reads it. Numbering makes that dependency visible rather than
alphabetically accidental.

**`can_put_up()` reads `divisions.skill_level_cap`, never a literal 23.** The column exists and
defaults to 23; hard-coding the number would make the column a lie.

**The seed makes the 23-Rule bind.** 03209's five strongest total 29 and 03211's total 27, so
"Would break 23" is reachable. A roster of all 4s (5 × 4 = 20) never triggers the rule, and
phase 6's blocked state would ship untested. 03207 deliberately never binds (22), as a control.

**The two dev identities can never sign in.** Nobody holds `dev-admin-google-sub` and there is
no password anywhere in the system; they exist only so role checks and the
captain-owns-this-night rule have something to resolve against before a real Google login.

## Verify — all passing
- Both files apply to a freshly seeded database with `ON_ERROR_STOP=1` and no errors.
- `race_chart` 6v6 → `5-5`; 4v5 → `3-4`.
- Inserting a row with two players and no skill levels populates all four snapshot columns and
  leaves `status = 'pending'`.
- 3–0 where the winner races 3 → `3/0` complete. 4–3 where both race 4 → `2/1` (hill). 4–1
  where the loser races 3 → `2/0`. 5–2 where both race 5 → `2/0`, matching the prompt's own
  `5–2 = 2/0` example.
- `team_matches` rolled up to `9 - 1` across four matches, by trigger, with no application code.
- With 20 skill levels committed on one side and a cap of 23: SL 6 → `would_break_23`, SL 3 and
  SL 2 → allowed, a player already playing → `already_put_up`, a player from another team →
  `not_on_roster`. `can_put_up()` agrees with `put_up_block_reason()` on every row.
- `players_stats` by trigger: the shutout winner shows `matches_played 1, matches_won 1,
  total_points 3, games_won 3, shutouts 1`.
- `change_skill_level()` raises on SL 9 and on a blank reason; a valid call moves the player
  4 → 6, writes one history row attributed to the admin, and **leaves the played match's
  snapshot at 4**.
- `player_division_stats` returns 30 rows, 22 with zeros rather than nulls.
- `team_standings` returns all four teams at 0 — correct, nothing is `submitted` yet.
