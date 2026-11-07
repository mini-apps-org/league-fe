# Kickoff prompt — Bida League MVP (paste into Claude Code in an empty repo)

`league-be` (Go) is the only backend: it owns Postgres and auth. Have its repo
available before you start — you need `db/migrations/` and `docs/swagger/swagger.json`.
Then paste everything below the line.

---

You are building the MVP of **Bida League**, a mobile-first web app for an 8-ball pool league (APA-style rules). Speed to release matters more than completeness: build exactly the scope below, nothing extra.

## Stack (do not change)
- Vite + React 19 (TypeScript), React Router, Tailwind CSS
- Zod for form validation; Vitest for unit tests
- Deploy target: Vercel. Make it an installable PWA (manifest + icons; no offline sync in MVP)
- **No database driver and no ORM in the frontend.** It has no DB credentials and never
  opens a connection. Every read and write is an HTTP call to `league-be`.

## Backend contract
`league-be` is a Go service (pgx + Postgres, deployed separately) exposing `/api/v1`.
It is the single source of truth for data and identity.

- **Auth is Google OAuth with a server-side session.** Sign-in is a full-page navigation to
  `GET {API}/api/v1/auth/google/login` — never `fetch`, because XHR cannot
  follow the 302 to Google and the user must see Google's origin in the address bar. The
  backend redirects back to `/` (or `/onboarding` for a new user), or to
  `/login?error=cancelled|login_failed|server_error`.
- **Deploy is a static build**: `pnpm build` → `dist`, served by Vercel with an SPA rewrite.
- The session is an **HttpOnly `sid` cookie**. The app never sees a credential and cannot
  read its own session, so **`GET /api/v1/me` _is_ the session check** — never infer auth
  from `document.cookie`. A 401 is terminal: there is no refresh endpoint.
- Every non-safe request echoes the readable `csrf` cookie as the `X-CSRF-Token` header. A
  hand-rolled `fetch` that forgets it gets a 403.
- ✅ **`app-id` is retired — do not send it.** This is a single app with its own database, so
  identifying the calling mini-app bought nothing. `league-be` has already removed the check:
  codes `40002` (missing app-id) and `40303` (app id not allowed) are **retired and must never
  be reassigned**, and there is no `ALLOWED_APP_IDS` config. A useful side effect: with no
  custom request header, a `GET` is CORS-simple and skips the preflight entirely.
- Errors are `{"error":{"code","message"}}` where `code` is a **5-digit string** (`"40101"`,
  not `40101`). Switch on the code, never the message.
- Successful responses are wrapped: `{"session_id","count","data","metadata"}`.
- Generate TypeScript types from `league-be/docs/swagger/swagger.json` into
  `src/lib/api.types.ts` (`openapi-typescript`). Do not hand-maintain response types.
- **Cross-origin cookies:** the API client sets `credentials: 'include'`, and `league-be`
  allows exactly one origin (`FRONTEND_URL`). If you fetch from a Server Component, forward
  the incoming `sid` cookie explicitly — it is not attached for you.

## Database (owned by league-be — frontend does not touch it)
Work in the `league-be` repo for everything in this section.

`db/migrations/00001_init.sql` already defines the league structure: `seasons`, `divisions`,
`venues`, `players`, `teams`, `team_rosters`, `skill_level_history`, `race_chart` (populated),
`team_matches`, `individual_matches`.

> ✅ **Resolved 2026-11-06/07 — this section is history, not instructions.** The outcome
> differed from what is described below, so do not rebuild from it:
> `users.id` is **`TEXT`**, not
> `bigint`, matching `auth.User.ID string` in Go; statuses are **`CHECK` constraints**, not
> enum types — nothing ever referenced those four types; roles live in the existing
> **`roles` / `users_roles`** tables, not a `users.role` column; the player↔user link is
> **`players.user_id`**, not `users.player_id`; and **`team_rosters`** had to be created,
> because nothing linked a player to a team. See
> `plans/20261104-2126-bida-league-mvp/plan-1-database-foundation.md` and `plan-2-…` for what
> actually shipped.

It was **not runnable** as written. The original instructions were:

1. **Add the missing enum types.** The migration references `user_role`,
   `team_match_status`, `side` and `indiv_match_status`; none are created. No `CREATE TYPE`
   exists anywhere in `db/migrations/`.
2. **Resolve the `users` collision.** The migration creates a `users` table with a `uuid` id
   referencing an external auth table that does not exist here. The **live** `users` table is the
   one `internal/auth/repositories.go` writes — `id bigint` identity, plus `google_sub`
   (unique), `email`, `email_verified`, `name`, `avatar_url`, `hd`, `created_at`,
   `last_login_at` — and it has no migration at all. So:
   - Write the migration that creates the auth `users` and `sessions` tables the Go code
     already queries. Nothing creates them today.
   - Drop the second `users` table and add `role user_role NOT NULL DEFAULT 'player'` and
     `player_id uuid UNIQUE REFERENCES players(id)` to the auth one.
   - Retype the three FKs that assume a uuid user to `bigint`:
     `skill_level_history.changed_by`, `team_matches.submitted_by`,
     `individual_matches.entered_by`.
   - There is no sign-up trigger to write: the Go handler upserts the user on first Google
     login (`ON CONFLICT (google_sub)`), and `is_new_user` drives the `/onboarding` redirect.
3. **Write the business logic. It does not exist yet.** `grep -riE "create (function|view|trigger)"`
   over `db/migrations/` returns nothing, so none of the following is available to call:
   - trigger on `individual_matches` → SL/race snapshot at put-up, winner and points
   - trigger → `team_matches.home_points` / `away_points` totals
   - `can_put_up()` → the 23-Rule check
   - `change_skill_level()` → admin SL edit, writing `skill_level_history`
   - views `player_division_stats`, `team_standings`

   Keep them in the database as planned, and expose each through a `league-be` endpoint. Once
   they exist, call them — do not re-implement them in the app.
4. **Seed data** as a migration or `make seed` target: 1 active season "Fall 2026", division
   "8-Ball Open", 1 venue "Saigon Cue Club", 4 teams (03209 Corner Pocket Crew, 03214 Eight
   Ball Bandits, 03211 Rack Attack, 03207 Side Pocket Social), 7–8 players per team with
   SL 2–7, week 10 fixtures.

Mirror the race chart and points rule in `src/lib/rules.ts` (pure functions) **only** for
instant UI previews, with Vitest tests that match the DB results: SL6 v SL6 race 5–5;
SL4 v SL5 race 3–4; win 3–0 = 3/0 points, 4–2 when loser race 5 = 2/1 (hill), 5–2 = 2/0.
The server's number always wins on save.

## Domain rules (MVP)
- A team night has 5 individual matches. Home team puts up first in match 1; teams alternate who puts up first after that (`first_put_up`).
- 23-Rule: a team's 5 players' SL total must stay ≤ 23. At put-up, grey out any player for whom `can_put_up()` is false and show "Would break 23".
- No live scoring. After each match the captain enters final games won for both players, total innings and defensive shots per player. The DB computes winner and points (3-0 shutout, 2-1 if loser reached the hill, else 2-0).
- A night is "submitted" by a captain after match 5; admins can still edit after.
- SL range 2–7. Admin SL change applies from the next match (matches keep their snapshot).

## Roles
Role comes from `users.role` on the `/api/v1/me` payload. The frontend uses it to hide
controls; **`league-be` enforces it** — a hidden button is not a permission check.
- **admin**: everything, incl. players, SL, transfers, rosters, schedule, corrections.
- **captain**: put up players and enter results for their own team nights; add an existing *paid* member of the division to their roster before match 1.
- **player**: read-only.

## Screens (design: https://claude.ai/code/artifact/22335122-0a40-471b-bd57-3308c6cebe0d)
Mobile-first; at ≥1024 px use the desktop layouts.
1. `/` Schedule — session select, week chips, fixture cards (home vs away, team numbers, venue, date/time, status).
2. `/matches/[id]` Team roster — Home/Away tabs, roster table (name + member ID, SL, MW/MP, points from `player_division_stats`), "Start match" button, "Add paid member" (captain).
   Desktop: schedule list left, both rosters side by side right.
3. `/matches/[id]/put-up` Put-up — "Match N of 5", opponent's put-up if they went first, SL used badge "x/23", available players with race preview vs opponent, blocked players greyed with reason, Confirm.
4. `/matches/[id]/result/[order]` Enter result — +/- steppers for games (capped at each race), innings, defensive shots, live verdict + points preview, Save → next put-up or night summary.
   Desktop `/matches/[id]` shows the whole night as one scoresheet table (5 rows, inline result entry for the current match) with the put-up panel at the side.
5. `/admin/players` — searchable table; side panel to change SL (2–7 buttons, shows race change vs SL 5), transfer team, reason (required), SL history.
6. `/login` — one "Sign in with Google" link (an `<a>`, not a button with `onClick`). Renders
   the `?error=` banner when present, and nothing at all for an unknown value.

## Design system
- One font family: **Inter** (400/500/600/700) via `@fontsource/inter`. No other fonts.
- Two themes with a toggle (default: system). Use CSS variables + Tailwind `darkMode: 'class'`:

| Token | Dark (grey) | Light (clean blue) |
|---|---|---|
| bg | #121212 | #F5F8FC |
| sunken | #181818 | #EEF3F9 |
| card | #1E1E1E | #FFFFFF |
| selRow | #252A33 | #EAF2FF |
| chip | #2C2C2C | #E6EEF8 |
| line | #333333 | #D9E2EC |
| inputLine | #3D3D3D | #C9D5E3 |
| text | #F2F2F2 | #0F2540 |
| text2 | #D0D0D0 | #2E4560 |
| muted | #A3A3A3 | #5B6B80 |
| accent | #5B9BFF | #1F6FEB |
| onAccent | #0B1220 | #FFFFFF |
| accentSoft | #1D2A40 | #E3EDFF |
| ok | #4CC38A | #12805C |
| warn | #F2A27E | #B4471F |

- One primary (accent) button per screen; touch targets ≥ 44 px; radius 12–16 px; no gradients, no emoji, inline SVG icons (lucide-react is fine).
- Accessible: real buttons/links/labels, text contrast ≥ 4.5:1.

## Project structure
```
src/app/(app)/page.tsx                    schedule
src/app/(app)/matches/[id]/...            roster, put-up, result
src/app/admin/players/page.tsx
src/app/login/page.tsx
src/components/ui/*                       Button, Card, Badge, Stepper, Tabs, Table
src/lib/api/{client,endpoints,errors}.ts  the only place that talks HTTP
src/lib/api.types.ts                      generated from league-be swagger
src/lib/rules.ts (+ rules.test.ts)
```

## Environment
```
VITE_API_URL             league-be origin
```
No database URL, no service key, no secret of any kind in this repo.

## Build order (commit after each step, run `pnpm build` + tests)
0. **In `league-be`:** the four Database fixes above — enums, the `users`/`sessions`
   migration and collision, the triggers/functions/views, seed. The frontend has nothing
   real to call until this lands.
1. Scaffold, Tailwind tokens + theme toggle, Inter, API client (CSRF + 401 handling),
   `/login`, auth gate, role from `/api/v1/me`.
2. Generated types from swagger; `rules.ts` with tests.
3. Schedule and Team roster screens (read-only).
4. Put-up flow against the `can_put_up()`-backed endpoint; create the `individual_matches` row.
5. Result entry; night summary; submit night.
6. Admin players: list, SL change via the `change_skill_level()` endpoint, transfer, history.
7. PWA manifest, error/empty/loading states, deploy to Vercel.

## Out of scope (do not build)
Coin flip, live tap-by-tap scoring, offline sync, rack-level data, notifications, payments, 9-ball.

## Definition of done
A captain can log in on a phone with Google, open tonight's match, put up 5 players without breaking 23, enter 5 results, see the team score (e.g. 3–2) and submit; an admin can change a player's SL and see it in history. Ask me before adding any dependency not listed above.
