# Phase 1 — Make the schema runnable and resolve the users collision

**Status: done and verified, 2026-11-06.**

## Goal
`league-be`'s migration applies cleanly to an empty Postgres, with one `users` table that the
Go auth code can actually read and write.

## What the problem turned out to be

`00001_init.sql` was rewritten on 2026-11-04 at 21:49, after this plan was first written, so
the original task list described a file that no longer existed. The corrected findings:

| Original assumption | Reality in the file |
|---|---|
| Four enum types referenced but never created | **No enum references at all** — statuses were unconstrained `TEXT`/`VARCHAR` |
| Two colliding `users` tables | **One** uuid stub: `id`, `display_name`, timestamps |
| `users.role user_role` to be added | Full RBAC already present and seeded: `roles`, `permissions`, `roles_permissions`, `users_roles` |
| Add `users.player_id` | Already exists inverted, as `players.user_id` |
| Three FKs to retype | **Six**, plus the new `sessions.user_id` |
| `team_rosters` exists | **Did not exist.** Nothing linked a player to a team |

The live defect was narrower and worse than described: the Go code's `auth.User.ID` is `int64`
and it runs `INSERT INTO users (google_sub, email, …) ON CONFLICT (google_sub)` against a table
that had neither column and a uuid key — and `sessions`, which every authenticated request
reads, was never created by anything.

## Tasks
- [x] Replace the `users` stub with the table `internal/auth/repositories.go` queries:
      `id BIGINT GENERATED ALWAYS AS IDENTITY`, `google_sub TEXT NOT NULL UNIQUE`, `email`,
      `email_verified`, `name`, `avatar_url`, `hd`, `created_at`, `last_login_at`.
- [x] Create `sessions` (`id TEXT PRIMARY KEY`, `user_id BIGINT` cascading, `created_at`,
      `last_seen_at`) and index `sessions (user_id)`.
- [x] Retype all six FKs into `users` from `UUID` to `BIGINT`: `players.user_id`,
      `skill_level_history.changed_by`, `team_matches.submitted_by`,
      `individual_matches.entered_by`, `users_roles.user_id`, `users_roles.granted_by`.
- [x] Create `team_rosters` with `left_at IS NULL` meaning "currently on the roster", a partial
      unique index giving each player one active roster, and a partial index on `team_id`.
- [x] Constrain the status columns with `CHECK`: `team_matches.status`,
      `individual_matches.status`, `individual_matches.first_put_up`.
- [x] Keep the RBAC tables and do **not** add `users.role`.

## Implementation notes

**`CHECK`, not `CREATE TYPE`.** The prompt's enum premise was obsolete — nothing in the file
references those four types. The real defect was that `status` accepted any string, so a typo
was stored silently and every consumer switching on it would miss. `CHECK` matches the file's
existing idiom (it already uses `CHECK` on nine columns) and avoids `ALTER TYPE ... ADD VALUE`
being non-transactional later.

**The RBAC tables stay.** `roles`/`permissions`/`users_roles` are built and seeded with
PLAYER/CAPTAIN/ADMIN plus seven permission codes. A `users.role` column would be a second
source of truth for the same fact. **Consequence for phase 3:** `/api/v1/me` derives `role`
from `users_roles`, so the frontend's role check reads the same shape the prompt describes even
though the storage differs.

**`team_rosters` uses close-then-open for transfers,** never `UPDATE team_id`. A played match
must stay reconstructable, and the partial unique index makes a player on two active rosters
impossible rather than merely discouraged.

**Two id types, on purpose.** League entities stay `uuid`; `users` is `bigint` because
`auth.User.ID` is `int64`. Confined to FKs *into* `users`, and far cheaper than retyping
working auth code.

## Verify — all passing
- `createdb` + `psql -v ON_ERROR_STOP=1 -f 00001_init.sql` against an empty database: applies
  with no error.
- One `users` table, columns `id bigint, google_sub, email, email_verified, name, avatar_url,
  hd, created_at, last_login_at`.
- All seven FKs into `users` report `bigint` on both sides.
- `sessions` and `team_rosters` both exist.
- The real upsert, run twice: `id=1 is_new_user=true`, then `id=1 is_new_user=false` with the
  name updated — one row, and `is_new_user` correctly drives the `/onboarding` redirect.
- `INSERT INTO sessions` against that user succeeds.

Not yet verified, because it needs a running server: the full Google round trip. Re-check at
the end of phase 3, when the `app-id` CORS fix lands.
