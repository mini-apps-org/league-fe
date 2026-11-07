# Phase 6 — Put-up, enforcing the 23-Rule

**Status: done, 2026-11-06.** `/matches/:id/put-up` with the server-driven candidate list,
"SL used x/23" badge, opponent panel, race previews, and blocked rows greyed with their
machine-readable reason. Unverifiable end to end until phase 3 exposes
`/team-matches/{id}/available`.

## Goal
A captain picks a player for match N of 5, with everyone who would break 23 visibly blocked,
and the confirmed pick creates the `individual_matches` row.

## Tasks
- [ ] `/matches/[id]/put-up` — header "Match N of 5".
- [ ] Show the opponent's put-up when they went first, including their SL and the resulting
      race.
- [ ] "SL used x/23" badge, live as the night fills.
- [ ] Available player list: each row shows name, SL, and the race preview against the
      opponent's already-put-up player (from `rules.ts`).
- [ ] Blocked players greyed out with the reason — "Would break 23" for `would_break_23`, and
      distinct copy for `already_put_up` and `not_on_roster`.
- [ ] Confirm → `POST /api/v1/team-matches/{id}/put-up`, then route to result entry for that
      match order.
- [ ] Handle the server's rejection (another captain picked first, or the list was stale):
      show the error and refetch rather than leaving a dead button.
- [ ] Alternation: home puts up first in match 1, then the side that puts up first alternates.
      Read `first_put_up` from the row; do not recompute it in the client.

## Implementation notes

**Layout, copy and states are specified in `ui-spec.md` → Screens** — element anatomy, both
breakpoints, every empty/loading/error/role variant, and the exact copy strings. Build against
it rather than re-deciding here; where it disagrees with the artboards, the artboards win and
the spec gets corrected.

**`can_put_up` comes from the server, per player.** Phase 3's `available` endpoint returns the
boolean and the reason, so the client never sums SLs to decide. The client may *display* the
running total for the badge, but the block decision is the server's.

**Grey out, never hide.** The design calls for a visible disabled row with a reason, because a
captain needs to understand why their best player is unavailable. A hidden row reads as a bug.
Use `aria-disabled` and keep the reason in the accessible name, not only in a `title`.

**The race preview only exists when the opponent has already put up.** In the half of the
matches where this side goes first, there is no opponent yet and the race is genuinely unknown
— show the player's SL alone rather than a placeholder race.

**This is where the seed matters.** If the seeded rosters never exceed 23, the blocked state
is unreachable and ships untested. Phase 2 was asked to seed a binding team; confirm it here.

## Verify
- Put up four players totalling SL 20, then open the put-up for match 5: every SL 4+ player is
  greyed with "Would break 23", and SL 2–3 players are selectable.
- The "SL used" badge reads `20/23` at that point.
- A player already put up tonight appears greyed with the already-put-up reason, not missing.
- Match 1 asks the home side to put up first; match 2 asks the away side.
- Confirming creates one `individual_matches` row with `home_sl`, `away_sl`, `home_race`,
  `away_race` populated by the phase 2 trigger.
- Force the race: put the same player up from two browsers; the second gets a clear error and
  a refreshed list, not a stuck spinner.
- Keyboard-only: the list is reachable, the blocked rows announce their reason, Confirm is
  reachable.
