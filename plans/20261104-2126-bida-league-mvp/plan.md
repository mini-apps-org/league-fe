# Plan: Bida League MVP

## Goal
Ship a mobile-first web app for an 8-ball pool league (APA-style) where a captain can run a
team night end to end on a phone: open tonight's fixture, put up 5 players without breaking
the 23-Rule, enter 5 results, see the team score and submit it — and an admin can change a
player's skill level and see it in history. `league-be` (Go + Postgres) owns all data and
identity; the frontend is a thin client over its `/api/v1` REST surface.

## Scope

**In scope**
- 6 screens: Schedule, Team roster, Put-up, Enter result, Admin players, Login.
- Google OAuth sign-in against `league-be`'s existing cookie-session auth.
- Three roles (admin / captain / player) with `league-be` enforcing them.
- The league schema made runnable, plus the business logic in Postgres (triggers,
  `can_put_up()`, `change_skill_level()`, two stats views) and REST endpoints over it.
- Light + dark theme, Inter, PWA install (manifest + icons).
- Zod validation on the two forms that take real input (result entry, SL change) and a Vitest
  suite over the `rules.ts` mirror.
- A written UI specification (`ui-spec.md`) covering foundations, components and all six
  screens at both breakpoints.

**Out of scope** (from the kickoff prompt, do not build)
Coin flip, live tap-by-tap scoring, offline sync, rack-level data, notifications, payments,
9-ball. Also out: any direct database access from the frontend.

## Architecture / Design decisions

**One backend, one source of truth.** `league-be` holds the DB credentials; the frontend
holds none. Every read and write is HTTP. This is why phases 1–3 are backend-only: the
frontend has nothing real to call until they land.

**Business rules live in Postgres, not in TypeScript.** The race chart, points calculation,
23-Rule and SL history are triggers/functions on the tables that own the data, so a direct
SQL correction by an admin produces the same numbers as the app. `src/lib/rules.ts` mirrors
the race chart and points rule *only* to preview a race before the row exists; **the
server's number always wins on save.** Phase 5's Vitest suite exists to catch the mirror
drifting from the DB.

**SL and race are snapshots.** `individual_matches` stores `home_sl`/`away_sl`/`home_race`/
`away_race` at put-up time, so a later admin SL change never rewrites a played match. This is
already in the schema and is the reason `change_skill_level()` is "applies from the next
match" rather than a plain `UPDATE`.

**Identity was the riskiest thing in this plan, and is now settled.** Two incompatible
`users` tables existed on paper — the one the Go auth code writes, and a uuid one left over
from an earlier schema draft. Phase 1 resolved it: one `users` table with a `TEXT` id matching
`auth.User.ID string`, and every FK into it retyped to match. See
`plan-1-database-foundation.md` for the outcome.

**`app-id` is retired, decided 2026-11-06.** One app with its own database, so identifying the
calling mini-app bought nothing. `league-be` had already dropped the check — codes `40002` and
`40303` are retired in `handler/error.go` and must never be reassigned — and the frontend now
sends no header and no login query param. Side benefit: with no custom header, a `GET` is
CORS-simple and skips the preflight.

**The dependency list is closed.** The prompt names the whole set — Tailwind, Zod, Vitest,
`openapi-typescript`, lucide-react — and ends with "ask me before adding any dependency not
listed above". A phase that finds it wants a form library, a date library or a client-state
manager raises it as a question rather than installing it; the three screens that take input
are small enough that Zod plus controlled inputs is the whole story.

**Auth is already built and working.** `league-be` has Google OAuth, sessions and CSRF;
`league-fe` (Vite SPA) already has a verified client for all of it. Phase 4
should port that client rather than rediscover it — see Open questions on which frontend
survives.

## Phases

| Phase | File | What it delivers |
|-------|------|------------------|
| 1 | plan-1-database-foundation.md | `00001_init.sql` becomes runnable: enums, the auth `users`/`sessions` migration, the `users` collision resolved, FKs retyped |
| 2 | plan-2-database-rules-and-seed.md | Triggers, `can_put_up()`, `change_skill_level()`, the two views, and seed data |
| 3 | plan-3-league-api-endpoints.md | REST endpoints over the above, role middleware, regenerated swagger |
| 4 | plan-4-frontend-scaffold-and-auth.md | Scaffold, design tokens, theme toggle, Inter, API client, `/login`, auth gate, role |
| 5 | plan-5-schedule-and-roster.md | Generated types, `rules.ts` + tests, Schedule and Team roster (read-only) |
| 6 | plan-6-put-up-flow.md | Put-up screen driven by `can_put_up()`, creating the `individual_matches` row |
| 7 | plan-7-result-entry-and-submit.md | Result entry with steppers and points preview, night summary, submit |
| 8 | plan-8-admin-players.md | Admin players table, SL change, transfer, SL history |
| 9 | plan-9-pwa-polish-deploy.md | PWA manifest, loading/empty/error states, accessibility pass, deploy |

`ui-spec.md` sits beside these as a cross-phase reference: the type scale, spacing ramp, token
usage map, component states and a per-screen anatomy for all six routes. Phase 4 builds its
Foundations and Components sections; phases 5–8 build its Screens. It is **derived from the
prompt, not from the artboards** — see Open question 2 and the spec's own "Open to the
artboards" list.

Phases 1 → 3 are strictly sequential and block everything. Phases 6, 7 and 8 are independent
of each other once 5 lands.

**Status as of 2026-11-07: all nine phases are built.** Backend: `go build`, `go vet`,
swagger at 18 paths, and an integration test covering every query and authorisation path
against a seeded database. Frontend: `typecheck`, `lint --max-warnings=0`, 42 tests, `build`.

What has **not** been exercised is the two running together: no browser has completed the
Google round trip against the finished API, so CORS, cookie flow and the Definition of Done
on a real phone are all still open. That is the next thing to do, and it needs Google OAuth
credentials in `league-be/.env`.

**Original status note, kept for context: phases 1–3 had not been started.** `league-be` still has one
migration with no enums, functions, views or triggers; `docs/swagger/swagger.json` lists five
paths (`/health`, `/me`, three auth routes) and none of phase 3's league endpoints; and the
league endpoints are unwritten. Phase 4's auth layer, by contrast, is largely built already. The agreed order is to land 1–3 before 5–8, so the frontend generates types from a
real spec and the Definition of Done can actually be walked.

## Success criteria

- `league-be` migrations apply from an empty database with no manual SQL.
- One `users` table exists; `SELECT` on it returns both the Google identity columns and
  `role`; `skill_level_history.changed_by`, `team_matches.submitted_by` and
  `individual_matches.entered_by` all reference it with matching types.
- Inserting a completed `individual_matches` row sets `home_points`/`away_points` on both the
  individual row and the parent `team_matches` with no application code involved.
- `can_put_up()` returns false for a player whose SL would push the team's 5 over 23.
- `rules.ts` tests pass and agree with the DB for: SL6 v SL6 → race 5–5; SL4 v SL5 → race 3–4;
  3–0 → 3/0 points; 5–2 → 2/0.
- `change_skill_level()` writes a `skill_level_history` row and leaves played matches' snapshots
  untouched.
- A browser (not curl) can complete `GET /api/v1/me` with no CORS error and no preflight.
- On a 390px viewport, a captain signs in with Google, opens a fixture, puts up 5 players
  totalling ≤ 23, enters 5 results, sees e.g. "3–2" and submits.
- A player account sees the same screens with no put-up or result controls, and a direct
  `POST` from that account is refused by the backend, not just hidden.
- Text contrast ≥ 4.5:1 in both themes; all tap targets ≥ 44px.
- Lighthouse installable-PWA check passes.

## Open questions

1. ~~**Which frontend is this?**~~ **Settled 2026-11-06: Vite + React 19 with React Router.**
   Fonts come from `@fontsource/inter`, env vars are `VITE_*`, and all fetching is
   client-side. Phase 4 is therefore a **port and a re-skin, not a scaffold**: the auth
   client, router, query client and shadcn primitives already exist and stay.

   Two conflicts this answer does not resolve, both still open:
   - **Bilingual or not?** `league-fe` ships i18next with `en` and `vi` bundles the prompt
     never mentions. Keeping them means every string in `ui-spec.md` is a key — cheap now,
     expensive to retrofit after six screens.
   - **The palette is a replacement, not an addition.** `src/index.css` currently holds a warm
     terracotta/cream palette (`--ink`, `--surface`, `--tint`, `--primary: #b4532f`) and
     Be Vietnam Pro, carried in from another project's spec. None of the prompt's 15 tokens
     are present, and `shadcn/tailwind.css` semantics are mapped onto the old ones. Phase 4
     has to swap both layers without breaking the existing primitives.
2. **The design artifact's screens cannot be read as text — resolved as far as it can be.**
   The URL in the prompt (`claude.ai/artifact/5DwuYu791b12YvW2cKyQ6p`) serves an empty
   artifact shell and matches no artifact in the owner's library, so it is dead; the prompt
   now points at the real one, **"Bida League Scorekeeper — UI"** at
   `claude.ai/code/artifact/22335122-0a40-471b-bd57-3308c6cebe0d`. That artifact is
   reachable, but its artboards are not retrievable from a terminal: the page it publishes is
   only the design tool's runtime shell, its asset store holds 0 files, and its shared
   database returns no documents in any collection. **So every pixel-level decision in this
   plan comes from the prompt's screen descriptions and its 15-token palette** — exact
   spacing, iconography, empty-state copy and the desktop scoresheet's column widths must be
   read off the artboards in a browser at implementation time, or pasted in as screenshots.
   Treat a disagreement between this plan and the artboards as the artboards being right.
3. **The points examples contradict the points rule.** The rule is "3-0 shutout, 2-1 if loser
   reached the hill, else 2-0". The worked example "4–2 when loser race 5 = 2/1 (hill)" does
   not fit: a loser racing to 5 who won 2 games is three games short of the hill (4), so by the
   rule that is 2/0. Either the example's numbers are wrong or "hill" means something other
   than *race − 1*. **Confirm the hill definition before writing the points trigger** — it is
   the one rule that silently produces wrong standings all season.
4. **Is `players.member_id` league-assigned or APA-issued?** The seed uses 8-digit values
   (`95007620`) while teams use 5-digit numbers (`03209`). Affects whether admins can create a
   player or only link an existing one.
5. **Who may submit a night, exactly?** "A night is submitted by a captain" — either captain,
   or only the home captain? Determines the authorization check in phase 7.
