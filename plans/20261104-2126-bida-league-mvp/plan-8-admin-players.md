# Phase 8 — Admin players: skill level, transfers and history

**Status: done, 2026-11-06.** `/admin/players` with debounced search, a bottom-sheet panel
holding the 2–7 skill-level buttons, the race-vs-SL-5 preview, a required reason validated by
Zod, transfer, and append-only history. Route-gated by `RequireAdmin`, which reads `role` from
`/api/v1/me` — phase 3 must add that field; until then `roleOf()` defaults to `player`, so the
screen is correctly refused.

## Goal
An admin can find any player, change their skill level with a recorded reason, move them
between teams, and read the full SL history.

## Tasks
- [ ] `/admin/players` — searchable table over `GET /api/v1/players?q=` (name or `member_id`),
      showing name, `member_id`, current SL, team.
- [ ] Side panel for the selected player.
- [ ] SL change: buttons 2–7, showing what the race becomes against an SL 5 opponent so the
      admin sees the effect of the change.
- [ ] Reason field, **required** — the submit control stays disabled until it is non-blank.
- [ ] A Zod schema for the SL-change payload — `new_sl` an integer in 2..7, `reason`
      non-blank after trimming — mirroring exactly what `change_skill_level()` rejects.
- [ ] Save → `POST /api/v1/players/{id}/skill-level`, calling `change_skill_level()`.
- [ ] Transfer team within the division.
- [ ] SL history list from `GET /api/v1/players/{id}/skill-level-history`: old → new, reason,
      who changed it, when.
- [ ] Admin-only route: a captain or player navigating here is refused, and the backend
      refuses the writes independently.

## Implementation notes

**Layout, copy and states are specified in `ui-spec.md` → Screens** — element anatomy, both
breakpoints, every empty/loading/error/role variant, and the exact copy strings. Build against
it rather than re-deciding here; where it disagrees with the artboards, the artboards win and
the spec gets corrected.

**"Applies from the next match" is a property of the data, not a flag to implement.** Phase
2's snapshot trigger already froze `home_sl`/`home_race` on played matches, so a plain SL
update cannot reach them. There is nothing to schedule or defer — but the UI should say so,
because an admin who does not know this will not trust the change.

**Reason is required by the function, so validate in both places.** `change_skill_level()`
rejects a blank reason; the UI must also disable submit, or the admin's work is lost to a 400
after they have typed everything else.

**The race-vs-SL-5 preview uses `rules.ts`**, the same mirror as the put-up preview. SL 5 is
the reference opponent because it is the middle of the 2–7 range.

**History is append-only.** `skill_level_history` has no update path and `changed_by` is the
`users.id` bigint from phase 1. Display the changer's name by joining, not by storing it.

## Verify
- Searching a partial name and a partial `member_id` both return the expected player.
- Submit stays disabled with an empty or whitespace-only reason.
- Changing SL 4 → 6 updates the table immediately and adds one history row showing `4 → 6`,
  the reason and the admin's name.
- A match played before the change still shows its original SL and race on
  `/matches/[id]`.
- The race preview for SL 6 vs SL 5 reads 5–4, matching `race_chart`.
- Transferring a player moves them in the roster on `/matches/[id]` for future nights.
- A `captain` session gets refused at the route *and* gets a 403 if the `POST` is replayed
  directly.
