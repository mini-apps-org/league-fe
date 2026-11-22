# Plan: Super-admin Session / Match CRUD

## Goal

A super admin can list, filter, sort, create, edit and delete **league sessions**, such as
Spring 2026, Summer 2026 and Fall 2026. Opening a session shows its **weeks** and its **team matches**.
Opening a team match shows its **5 individual matches**, which the super admin can edit or reset.

league-be has the tables but serves no routes for them yet, so the whole feature is built against
**MSW mocks** that implement the contract below. When league-be ships the routes, the switch is a
flag flip plus whatever contract changes the backend makes.

## Scope

**In:**
- the admin screens under `/admin/sessions`
- types, `LeagueAPI` methods, query factories and mutation hooks
- an in-memory MSW mock store, usable in dev and in tests
- i18n (en and vi). Tests are written only when asked for.

**Out:**
- backend work in league-be
- the schedule generator (Phase 2 of the design, F39a)
- byes and no-play weeks (`schedule_weeks`, Phase 2)
- forfeits
- pagination. Sessions number about three a year, and a session's matches stay under league-be's
  `MaxLimit` of 200.
- league and division management
- a league selector. This is single-league for now (see open question 2).

## Background

Sources: league-be `db/migrations/00001_init.sql` and league-solution-design
`docs/solution-design/04-domain-rules.md`, `06-data-model.md`, `07-api-design.md` and
`11-security-and-roles.md`.

**Hierarchy:**
```
leagues 1─* league_sessions 1─* divisions (season_id) 1─* teams
                                 divisions 1─* team_matches (week_no, home/away → teams, venue)
                                               team_matches 1─5 individual_matches (match_order 1..5)
```

- **A week is not a table.** It is `team_matches.week_no`. A session's weeks are the distinct
  `week_no` values across all of its divisions' team matches.
- **`league_sessions`** columns:
  - `name`, unique per league
  - `session_type`: `SPRING | SUMMER | FALL`
  - `season_year`
  - `starts_on` and `ends_on`, where `ends_on >= starts_on`
  - `status`: `DRAFT | IN_PROGRESS | COMPLETE | CANCELLED`
  - `is_active`
- **`team_matches`**: `status` is lowercase `scheduled | in_progress | submitted`, with no DB CHECK.
  The DB does enforce `home_team_id <> away_team_id`.
- **`individual_matches`**:
  - `UNIQUE (team_match_id, match_order)` with `match_order` 1..5, and `status` `pending | complete`.
  - SL and race are snapshotted at put-up and never overwritten (R-050, R-125).
  - Points come from the server, never the frontend (ADR-004): a shutout is 3/0, a hill loss
    (`loser_games >= race - 1`) is 2/1, and anything else is 2/0.
- **Exactly 5 individual matches per team match (R-003).**
- **Permissions** come from the league-be seed:
  - `session.read|create|update|delete` and `match.read|create|update|delete`.
  - `match.update` also covers individual matches.
  - SUPER_ADMIN holds every permission. The server enforces them; frontend gates are cosmetic.

## Design decisions

- **Naming follows league-be: "session", not "season".** `/admin/seasons` becomes `/admin/sessions`.
  The old `Season` type and `ENDPOINTS.SEASONS` stay for the parked code.
- **Filter, sort and week selection live in the URL search params**, so a filtered view can be
  shared and survives Back.
- **Forms and confirmations open in `Drawer`** (`.claude/rules/shadcn.md`), never `window.confirm`.
- **Forms use react-hook-form with Zod** (`zodResolver`) and the shadcn `field` primitives. Zod
  messages are i18n keys.
- **UI primitives are stock shadcn.** Only the colours are customised. Call sites set layout and
  colour, never a primitive's size.
- **Individual matches are never created or removed on their own.** The server creates 5 pending
  rows with the team match. DELETE on an individual match resets it to pending.
- **The frontend never computes authoritative points.** Only the mock mirrors the trigger rules, so
  the UI shows realistic numbers.
- **Access:** routes sit under the existing `RequireRole allowed={[ROLE.SUPER_ADMIN]}` group. Action
  buttons are wrapped in `PermissionGate` with the matching `session.*` or `match.*` code.
- **Mocks live in `src/test/mocks/`**, shared by the dev worker and by tests. `src/test/handlers.ts`
  keeps the `/me` fixtures and re-exports `envelope` and `apiError`.

## Proposed API contract

This contract is the frontend's proposal; MSW implements it, and it is meant to be handed to league-be.

- All paths are under `/api/v1`. Responses use `ApiEnvelope<T>`
  (`{session_id, count, data, metadata?}`), with `count` = total for lists.
- Query params are snake_case and bodies are camelCase.
- A create returns 201, a PATCH is a partial update, and a DELETE returns 204.
- Errors use `{error:{code,message}}`.

### Sessions

| Method & path | Body / params | Errors |
|---|---|---|
| `GET /sessions` | `q` (case-insensitive name contains), `session_type`, `season_year`, `status`, `sort` = `name` · `-name` · `starts_on` · `-starts_on` (default) · `season_year` · `-season_year` | 40001 bad param |
| `GET /sessions/{id}` | | 40401 |
| `POST /sessions` | `{name, sessionType, seasonYear, startsOn, endsOn, status?, isActive?}` | 40001, 40901 duplicate name |
| `PATCH /sessions/{id}` | any subset of the create body | 40001, 40401, 40901 |
| `DELETE /sessions/{id}` | cascades to divisions, teams and matches | 40401 |
| `GET /sessions/{id}/weeks` | → `[{weekNo, matchCount, submittedCount, firstScheduledAt}]`, ordered by `weekNo` | 40401 |

Each session in a response also carries two derived fields, added for the
[Sessions Redesign](../20261121-sessions-redesign/plan.md):

- `weekCount`: the number of distinct `week_no` values across the session's team matches.
- `hasSubmittedResults`: whether any of the session's team matches is `submitted`.

`POST` and `PATCH` with `isActive: true` deactivate the league's other sessions (one active
session per league).

Sample `LeagueSession`:
```json
{ "id": "uuid", "leagueId": "uuid", "name": "Spring 2026", "sessionType": "SPRING",
  "seasonYear": 2026, "startsOn": "2026-02-02", "endsOn": "2026-05-18",
  "status": "COMPLETE", "isActive": false, "weekCount": 10, "hasSubmittedResults": true,
  "createdAt": "…", "updatedAt": "…" }
```

### Lookups (fill the match form selects)

| Method & path | Returns |
|---|---|
| `GET /divisions?session_id=` | `Division[]` |
| `GET /teams?division_id=` | `TeamRef[]` |
| `GET /teams/{id}/roster` | `[{playerId, fullName, skillLevel}]` (active roster) |
| `GET /venues` | `VenueRef[]` |

### Team matches

| Method & path | Body / params | Errors |
|---|---|---|
| `GET /team-matches` | `session_id` (required for admin), `week_no`, `division_id`, `team_id` (home **or** away), `status`, `sort` = `week_no` (default; then `scheduled_at`) · `-week_no` · `scheduled_at` · `-scheduled_at` | 40001 |
| `GET /team-matches/{id}` | → `AdminTeamMatch` plus `individualMatches: IndividualMatch[5]` | 40401 |
| `POST /team-matches` | `{divisionId, weekNo, homeTeamId, awayTeamId, venueId?, scheduledAt}`; the server creates 5 pending individual matches with `firstPutUp` alternating, home on odd orders | 40001 (home = away, team outside the division, `weekNo < 1`) |
| `PATCH /team-matches/{id}` | any subset of the create body, plus `status` | 40001, 40401 |
| `DELETE /team-matches/{id}` | cascades to the individual matches | 40401 |

### Individual matches

| Method & path | Body | Errors |
|---|---|---|
| `PATCH /individual-matches/{id}` | `{homePlayerId?, awayPlayerId?, homeGames?, awayGames?, innings?, homeDefShots?, awayDefShots?, status?}`. Once both players are set, the server snapshots SL and race. The server computes points and rolls them up to the team match. | 40001 (games over the race, both sides at race, player not on roster, player already used that night) |
| `DELETE /individual-matches/{id}` | resets players, snapshots, scores and points; `status = pending` | 40401 |

## Phases

| Phase | File | What it delivers |
|---|---|---|
| 1 | [plan-1-contract-and-mocks.md](plan-1-contract-and-mocks.md) | Types, `LeagueAPI` methods, query factories, mutation hooks, MSW mock store, dev worker flag |
| 2 | [plan-2-sessions-list.md](plan-2-sessions-list.md) | `/admin/sessions`: list, filter, sort, create, edit, delete |
| 3 | [plan-3-session-weeks-matches.md](plan-3-session-weeks-matches.md) | `/admin/sessions/:sessionId`: weeks strip, match list with filters, team match CRUD |
| 4 | [plan-4-individual-matches.md](plan-4-individual-matches.md) | `/admin/sessions/:sessionId/matches/:matchId`: 5 individual matches, edit, reset |

Phase 1 blocks the rest. Phases 2 → 3 → 4 each link into the next, but each can be reviewed on its own.

**Status, 2026-11-21:** Phases 1 and 2 done; Phase 2 still needs a manual browser check. Phases 3–4 planned.

## Success criteria

- A super admin can reach `/admin/sessions` from the admin sidebar and do every action above
  against the mocks with `VITE_API_MOCKS=true pnpm dev`.
- Filter, sort and week selection survive a reload and Back.
- A captain or player who opens any of these routes sees `auth.unauthorized`.
- Every failure is shown with `messageFor(err)`.
- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass.
- The en and vi files have the same shape.

## Open questions

1. When league-be builds these routes, does it adopt this contract? Does it use `/sessions` (to
   match the table and permission codes) or `/seasons` (to match the design docs and
   `ENDPOINTS.SEASONS`)?
2. `league_sessions.league_id`: is a league selector needed now, or is it single-league (MVIP)?
3. Should `is_active` be exclusive per league? The DB doesn't enforce it. Should activating one
   session deactivate the others?
4. `team_matches.status` has no CHECK constraint. Confirm `scheduled | in_progress | submitted`.
5. Should deleting a session or team match that has submitted results be blocked (409), or
   allowed with a warning?
6. Should a super admin be allowed to edit individual matches after the night is `submitted`?
   The design says yes (FR-14.8); confirm that it re-rolls the points.
