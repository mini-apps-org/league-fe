# Phase 3 — `next` through the round trip, and the signed-in `/login`

**Status: done, 2026-11-07.** `src/lib/next-path.ts` with 24 tests, consumption wired through
`RequireAuth` → `NextPathRedirect`, storage written at click time, and `/login` redirecting an
already-signed-in user.

## Goal
A deep link survives sign-in, and an already-signed-in user never sees the login screen.

## Tasks
- [x] `src/lib/next-path.ts`: `rememberNextPath(path)`, `takeNextPath()` → a validated path or
      `/`. Accepts only a same-site **relative** path: must start with a single `/`, must not
      start with `//`, must have no scheme and no host.
- [x] `/login` writes the attempted path before navigating to Google; the post-sign-in landing
      reads and clears it.
- [x] `RequireAuth` records the attempted path when it bounces someone to `/login`.
- [x] `/login` redirects to `/` when the session is already valid.
- [x] Vitest for the sanitiser — see `plan-5-tests.md`.

## Implementation notes

**`sessionStorage`, not React state or a query param.** Sign-in is a full-page navigation to
the backend, which then redirects to Google and back, so the SPA is destroyed and rebuilt and
no in-memory state survives. The alternative is threading `next` through the backend's redirect
chain, which means a backend change and puts a user-supplied path in the access log. Storage is
same-origin, costs nothing, and is cleared on tab close.

**Treat what comes back out of storage as untrusted.** It is the house rule for browser storage
and it applies literally here: anyone can write `sessionStorage` from the console, so the
validation has to happen on **read**, not only on write. `//evil.com` is the case that catches
naive checks — it has no scheme, starts with `/`, and a browser treats it as protocol-relative,
so `startsWith('/')` alone is an open redirect.

**Clear it on read.** A stale `next` from an abandoned attempt would hijack the *next* sign-in,
sending a user somewhere they never asked to go.

**The `/login` redirect needs the session check, not a cookie sniff.** The `sid` cookie is
HttpOnly and unreadable, so "already signed in" means `/api/v1/me` returned 200 — the same
check everything else uses.

## Verify
- Signed out, visiting `/matches/abc` lands on `/login`; completing sign-in lands back on
  `/matches/abc`.
- `//evil.com`, `https://evil.com`, `javascript:alert(1)` and `../../etc` all resolve to `/`.
- `/matches/1` and `/admin/players` are both accepted.
- A second sign-in with no deep link goes to `/`, not to wherever the previous attempt pointed.
- Signed in, visiting `/login` redirects to `/` rather than showing the button.


---

## Outcome, 2026-11-07

### Files
`src/lib/next-path.ts` + `next-path.test.ts` (24 cases), `src/components/NextPathRedirect.tsx`,
and edits to `RequireAuth`, `GoogleSignInButton` and `LoginPage`.

### The sanitiser parses rather than string-matches

`validateNextPath` resolves the candidate against a sentinel origin and refuses anything that
moves away from it. That is what catches `//evil.com`: it has no scheme and starts with a
slash, so `startsWith('/')` passes it, and the browser then reads it as protocol-relative.
Also refused: absolute URLs, `javascript:` and `data:`, backslashes (some browsers normalise
`\` to `/`, so `/\evil.com` can escape), bare relative paths, and empty input. Dot segments
are normalised away rather than trusted — `/matches/../admin/players` becomes
`/admin/players`.

**Validation happens on read, not only on write**, because `sessionStorage` is editable from
the console. There is a test that injects `https://evil.com` directly into storage and asserts
the read refuses it.

### Added beyond the plan: the auth routes are refused as destinations

`/login` and `/onboarding` are both valid-looking paths and both gates, so a stored value
pointing at either would bounce the user between screens. They are rejected at the single
chokepoint, which covers write and read together.

### Why consumption lives in a component, not in the guard's render

Reading the stored path also clears it — a side effect that must happen exactly once.
`RequireAuth` decides with a pure `peekNextPath()` and delegates to `NextPathRedirect`, whose
effect does the take-and-navigate behind a ref guard that survives StrictMode's double-invoked
effects in development. It renders a skeleton, so the schedule does not flash before the user
is moved to the page they asked for.

**The order of the guards matters and is deliberate:** session → link gate → stored path. An
unlinked user finishes linking first, and their deep link still survives, because linking also
returns them to `/`.

### Redirect chains, traced to termination
- Signed out + deep link → `/login` → Google → `/` → the deep link.
- Signed out, unlinked, deep link → `/login` → Google → `/` → `/onboarding` → link → `/` →
  the deep link.
- Signed in visiting `/login` → `/`.
- Hostile value injected into storage → ignored, user stays put.
- A stored auth route → impossible on write, and refused on read.

### Verify — passing
- `pnpm typecheck`, `pnpm lint --max-warnings=0`, **66 tests**, `pnpm build`.
- `/login?next=/matches/abc` serves, and every new module compiles.

### Not verified
The round trip itself. Confirming that the path survives Google and lands the user on their
deep link needs a browser and a real sign-in.
