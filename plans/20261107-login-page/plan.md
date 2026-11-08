# Plan: Sign-in UI

Stack: **Vite + React 19**, React Router, Tailwind, shadcn primitives. `league-be` (Go)
owns identity; the frontend holds no credentials and talks to it over HTTP. This plan is
**UI only** — no schema work.

> **Repo state, 2026-11-07.** Everything that is not sign-in has been parked so this flow can
> be finished and stabilised on its own:
> - **Frontend** — the league screens, components, hooks and pure logic are in
>   `league-fe/_parked/`, with `_parked/RESTORE.md` listing what moved and how to bring it
>   back. They sit outside `src/`, so they are neither compiled nor linted while parked.
>   `league-fe` has no commits, so `git stash` was unavailable and the files were moved
>   instead. Nothing was deleted.
> - **Backend** — `internal/league/`, migrations `00002`/`00003`, the league routes and the
>   `role` + `playerId` additions to `/api/v1/me` are in `league-be`'s `stash@{0}`
>   ("stash importatn").
>
> Routes while parked: `/login`, `/rules`, `/privacy`, `/` (a signed-in placeholder) and
> `/onboarding`.

## Goal
Make signing in look like the product: a designed login screen at both breakpoints in both
themes, and a first-run step where a new user claims their league identity by member ID.

## Scope

**In scope**
- `/login` — the designed screen: app mark, tagline, Google's official button, legal line.
  Mobile column and the ≥1024px two-column brand layout.
- `/onboarding` — the member-ID step: input, preview card, confirm. Replaces today's stub.
- The gate that keeps a signed-in but unlinked user on `/onboarding`.
- `?next=` surviving the sign-in round trip, with same-site validation.
- Placeholder `/rules` and `/privacy`, reachable while signed out.
- Vitest for the pure logic: path sanitising, member-ID normalising, error mapping.

**Out of scope**
- Any schema or migration work.
- Email/password, magic links, "remember me".
- Admin role assignment.
- Playwright — a new dependency, and it cannot automate real Google sign-in. See
  `plan-4-tests.md`.

## Backend dependency

The member-link screen needs two endpoints that do not exist yet:

| Endpoint | Returns |
|---|---|
| `GET /api/v1/members/preview?member_id=` | the player behind an ID: name, skill level, team, whether already claimed |
| `POST /api/v1/me/link` | claims it for the signed-in account |

Plus `playerId` on the `/api/v1/me` payload, so the gate can tell whether linking is needed.
**`plan-2` builds its screen against that contract** the same way the league screens were
built ahead of their API: typed calls in `src/api/`, and the screen renders its error state
until the endpoints land.

**Both endpoints and the `/me` change were written and verified on 2026-11-07, then parked**
into `league-be`'s `stash@{0}` along with the rest of the league package. `preview_member()`
and `link_member()` were exercised directly in SQL first: preview of an unclaimed member,
no row for an unknown id, an idempotent re-link of the same pair, and both refusals
(`LNK01` not found, `LNK02` taken). Restoring the stash brings them back.

Worth knowing: until something writes `players.user_id`, `viewerCanManage` is false for every
real user, so put-up, result entry and submit stay hidden. The linking screen is the UI half
of fixing that.

## Design reference

The artboards are in **"Billiard League Scorekeeper — UI"**,
`claude.ai/code/artifact/22335122-0a40-471b-bd57-3308c6cebe0d` — the sign-in artboards,
mobile and desktop, dark and light. The link in the original prompt
(`claude.ai/artifact/5DwuYu791b12YvW2cKyQ6p`) is dead and matches no artifact.

The artboards are not readable as text from a terminal, so the layout below comes from the
written description plus `../20261104-2126-bida-league-mvp/ui-spec.md`. **Where they
disagree, the artboards win.**

## Architecture / Design decisions

**The sign-in control stays an `<a href>`.** It is a full-page navigation to
`GET /api/v1/auth/google/login`: XHR cannot follow the 302 to Google, and the user must see
Google's own origin in the address bar. Any spinner is cosmetic — the page is already leaving.

**`next` cannot live in React state**, because that navigation tears the SPA down. It goes in
`sessionStorage` before leaving and is validated on the way back — on read, not only on write,
since anyone can edit storage from the console.

**The gate lives in `RequireAuth`.** There is no server runtime to hold a middleware, and that
component already owns the session check and already has the `/api/v1/me` response in hand.

**Google's mark is the one palette exemption.** `ui-spec.md` allows no colour outside the 15
tokens; Google's branding terms require the unmodified four-colour mark beside "Sign in with
Google". Use the official asset and record the exemption beside it.

## Phases

| Phase | File | What it delivers |
|-------|------|------------------|
| 1 | plan-1-login-screen.md | The designed `/login`, both breakpoints, Google button, legal pages |
| 2 | plan-2-member-link-screen.md | The `/onboarding` member-ID step and the unlinked gate |
| 3 | plan-3-auth-edges.md | `?next=` round trip with sanitising; signed-in `/login` redirect |
| 4 | plan-4-tests.md | Vitest for the pure logic |

Phase 1 depends on nothing. Phase 2 needs the two endpoints above to be exercisable, though
its UI can be built and reviewed before they exist.

## Success criteria

- `/login` matches the artboards at 390px and ≥1024px, in both themes, with no horizontal
  scroll and contrast ≥ 4.5:1.
- The Google button carries the official mark, unrecoloured by the theme, and is a real link.
- `/rules` and `/privacy` load while signed out.
- `?error=cancelled` renders its banner; an unknown value renders nothing.
- A signed-in user with no linked player cannot reach any screen except `/onboarding`.
- Entering a member ID shows that player's details **before** anything is written.
- `/matches/abc` survives the round trip; `//evil.com` and `https://evil.com` resolve to `/`.
- `pnpm typecheck`, `pnpm lint --max-warnings=0`, `pnpm test`, `pnpm build` pass.

## Open questions

1. **What does the preview show?** It hands a real person's details to anyone who guesses an
   8-digit ID, and the seeded IDs are sequential (`95007620`, `95007621`, …). Recommendation:
   **first name and team number only** — enough to recognise yourself, little use to anyone
   else. This is a UI decision as much as an API one, so it belongs here.
2. **Is the member ID always 8 digits?** The original prompt asserts it. If it is a real rule
   the input mask should enforce it; if not, the mask should not.
3. **Tagline and the three desktop check-mark points** are not written down anywhere. Taken
   from the original prompt for now: "Run league night without the paper scoresheet."
