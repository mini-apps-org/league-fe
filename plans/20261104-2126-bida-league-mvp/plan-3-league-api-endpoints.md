# Phase 3 — Expose the league over `/api/v1` and fix the CORS gap

**Status: done and verified, 2026-11-07.** 13 endpoints across
`internal/league/{models,model_handlers,repositories,services,handlers}.go` plus
`internal/platform/router/league.go`, `role` added to `/api/v1/me`, swagger regenerated
(5 paths → 18), and an integration test exercising every query against a seeded database.


## Goal
Every screen in the MVP has an endpoint to call, the swagger spec describes them, and a
browser can actually reach them.

## Tasks
- [x] ~~Add `"app-id"` to `config.AllowHeadersAPI`.~~ **Void as of 2026-11-06:** `app-id` is
      retired by decision — one app, its own database, nothing to identify. The backend had
      already removed the check (codes `40002` and `40303` are retired in
      `handler/error.go`), and the frontend no longer sends the header, so the CORS allow-list
      stays `["Accept","Content-Type","Origin","X-CSRF-Token"]`.
- [x] `GET /api/v1/seasons` and `GET /api/v1/divisions?season_id=` — populate the session select.
- [x] `GET /api/v1/team-matches?division_id=&week_no=` — fixture cards: both teams' numbers
      and names, venue, `scheduled_at`, `status`, current points.
- [x] `GET /api/v1/team-matches/{id}` — one night: both rosters with `player_division_stats`
      joined (name, `member_id`, `current_sl`, MW/MP, points), and the 5 `individual_matches`
      rows with their snapshots and results.
- [x] `GET /api/v1/team-matches/{id}/available?side=&match_order=` — the put-up list: every
      roster player with a `can_put_up` boolean and, when false, a machine-readable reason
      (`would_break_23` | `already_put_up` | `not_on_roster`).
- [x] `POST /api/v1/team-matches/{id}/put-up` — body `{ match_order, side, player_id }`.
      Re-check `can_put_up()` server-side and reject with 400 `40001` if false.
- [x] `PUT /api/v1/individual-matches/{id}/result` — body
      `{ home_games, away_games, innings, home_def_shots, away_def_shots }`. The triggers do
      the scoring; the handler returns the row with computed points.
- [x] `POST /api/v1/team-matches/{id}/submit` — set `status` submitted, `submitted_by`,
      `submitted_at`. Captain-only; admins may still edit afterwards.
- [x] `GET /api/v1/players?q=` — admin search by name or `member_id`.
- [x] `POST /api/v1/players/{id}/skill-level` — body `{ new_sl, reason }` → calls
      `change_skill_level()`. Admin-only.
- [x] `GET /api/v1/players/{id}/skill-level-history`.
- [x] `POST /api/v1/teams/{id}/roster` — captain adds an existing **paid** member of the
      division. Reject an unpaid player with a distinct code.
- [x] Role middleware reading `users.role`, applied per route. Add `role` to the `/api/v1/me`
      payload (`auth.UserResponse`).
- [x] `make swagger` and commit `docs/swagger/`.

## Implementation notes

**No custom request headers on safe methods, which is now a property worth keeping.** With
`app-id` gone, a `GET` carries only simple headers, so the browser skips the preflight
altogether. Adding any custom header back to a `GET` reintroduces a preflight and, if the
allow-list is not updated in the same change, fails before the request is sent — with **empty
server logs while curl still succeeds**, which reads as a frontend bug for as long as you let
it. If a new header is ever needed, add it to `AllowHeadersAPI` in the same commit.

**Authorization is per-route and server-side.** The frontend hides controls by role, but that
is cosmetic. A captain must only put up and enter results for *their own team*, which means
the check is not "role == captain" but "role == captain AND `users.player_id` is the
`captain_player_id` of the home or away team on this night". Write that as one helper and
reuse it; it is the only non-trivial authorization rule in the MVP.

**Re-check `can_put_up()` in the handler even though the UI already greyed the player out.**
Two captains on two phones can put up simultaneously; the UI's list is stale the moment it
renders.

**Reuse the existing error registry.** Codes are 5-digit strings in
`internal/platform/handler/error.go`. Allocate new ones from the next free number for their
status; never renumber a shipped code. A rejected put-up and an unpaid roster add should be
distinguishable by code, because the UI shows different copy for each.

**Responses stay wrapped** in `config.SuccessResponse` (`session_id`, `count`, `data`,
`metadata`) so the frontend's existing envelope handling keeps working. Use `count` for the
list endpoints.

## Verify
- From a browser page on `FRONTEND_URL`, `fetch('/api/v1/me', {credentials:'include'})`
  succeeds with no CORS error and **no preflight in the Network tab**. This is the check that
  must be done in a browser, not curl.
- `GET /api/v1/me` includes `role`.
- `GET /api/v1/team-matches/{id}/available` marks the SL that would break 23 as
  `can_put_up: false` with reason `would_break_23`.
- `POST .../put-up` with that same player returns 400 and the validation code, even though
  the GET already said no.
- `PUT .../result` with 3–0 returns `home_points: 3`, `away_points: 0`.
- A `player`-role session gets 403 on every POST/PUT above.
- A captain of team A gets 403 posting to a night between teams B and C.
- `docs/swagger/swagger.json` lists every new route.


---

## Outcome, 2026-11-07

### Deviations from this plan

- **`GET /teams?division_id=` was added.** The admin transfer control needs a team list and
  this plan specified no endpoint for it.
- **`viewerCanManage` and `viewerSide` are on the night payload.** The captain-owns-this-night
  rule is a join across `teams.captain_player_id` and `players.user_id`, so the server answers
  it once and the UI never re-derives it.
- **`week_no` is optional** on `/team-matches`. The schedule fetches a division once and
  derives its week chips, which removes a hard-coded week range from the client.
- **Two new error codes**, because this plan asked for a rejected put-up and an unpaid roster
  add to be distinguishable: `40003 UNPAID_MEMBER` and `40004 PUT_UP_REJECTED`. Both added to
  the frontend registry and both locales.
- **Role is not a column.** `/me` derives it from `users_roles` with
  `ADMIN > CAPTAIN > PLAYER` precedence; a user with no row reads as `player`, the least
  privilege.
- **Request bodies are camelCase**, matching the responses and the existing
  `auth.UserResponse`. `DecodeJSON` rejects unknown fields, so the frontend's four write
  bodies were converted from snake_case in the same change — they would have 400'd otherwise.

### Phase 2 had to be restored first

The last `league-be` commit dropped `00002_business_rules.sql`, the `team_rosters` table and
two of three status `CHECK`s, and changed `users.id` from bigint to `TEXT` (correctly — Go's
`auth.User.ID` is a string now). The endpoints call `can_put_up()` and `change_skill_level()`,
so phase 2 was recreated adapted to `TEXT` ids before any Go was written. **The seed was
broken in the meantime**, because it inserts into `team_rosters`.

### Verify — all passing

`go build ./...`, `go vet ./...`, `make swagger` (18 paths), and
`LEAGUE_TEST_DATABASE_URL=... go test ./internal/league/ -run Integration`, which asserts:

- Reference data: 4 teams, cap 23, 2 fixtures in week 10, and the unfiltered list is a
  superset.
- The team and venue joins populate — the `aw` alias exists because `at` is a SQL keyword.
- `player_division_stats` returns a non-empty roster.
- A put-up on an empty night is allowed; **the same player a second time is refused**.
- The snapshot trigger fires only once both sides are up, and populates both races.
- A shutout scores `3/0` and rolls the night up to `3`.
- Games above the race are refused before reaching the trigger.
- Submitting an incomplete night is refused.
- The assembled detail carries both rosters, the matches and `viewerCanManage`.
- Search finds a seeded surname, and `100%` is matched literally rather than as a wildcard.
- `change_skill_level` writes history with the changer's name joined; SL 9 and a blank reason
  are both refused.
- An unpaid member cannot be added to a roster.
- **A player-role user can read but cannot search players or put up.**

Still unverified, because it needs a running server with Google credentials: the browser
round trip (CORS, no preflight, the full sign-in).
