# Phase 4 — Frontend scaffold, design tokens and the auth gate

**Status: done, 2026-11-06.** Palette swapped to the 15 blue/grey tokens in both themes, Inter
replacing Be Vietnam Pro, theme toggle (system → light → dark), `app-id` removed, English made
the default locale, and `src/lib/icons.ts` added as the single icon entry point.

## Goal
A themed, installable shell where a user signs in with Google and the app knows their role.

## Tasks
- [ ] (Reactjs v19 vs keep the existing Vite SPA). Do not
      start until it is answered — it decides whether this phase is a scaffold or a port.
- [ ] Scaffold the app with TypeScript, Tailwind and Vitest.
- [ ] Inter 400/500/600/700 as the only font family, self-hosted via
      `@fontsource/inter`. If this phase is a port, **remove `@fontsource/be-vietnam-pro`** —
      the prompt allows exactly one family, and leaving both ships two.
- [ ] The 15 design tokens as CSS variables on `:root`, redefined for dark, wired into
      Tailwind. Exact values are in the kickoff prompt's token table — treat it as the palette
      and introduce no other colours.
- [ ] Theme toggle: default `system`, an explicit choice persists and wins. Dark is a `class`
      on the root element.
- [x] The HTTP layer already exists and stays at **`src/api/`**, not `src/lib/api/`: the
      prompt's path contradicts this repo's own rule (`.claude/rules/clean-code.md`: "All
      requests go through `src/api/`", lint-enforced). `axios.ts` echoes the `csrf` cookie as
      `X-CSRF-Token` on non-safe methods, sets `withCredentials`, and `lib/errors.ts`
      normalises `{error:{code,message}}` keyed on the **5-digit string** code.
- [x] **`app-id` removed, 2026-11-06.** No header, no query param on the login URL, no
      `VITE_APP_ID`, and the retired codes `40002`/`40303` dropped from `types/errors.ts` and
      both i18n bundles.
- [ ] Install Zod now, unused — phases 7 and 8 both need it, and it is on the prompt's
      approved list. Add no dependency that is not.
- [ ] A 401 is terminal: redirect to `/login`, except on `/api/v1/me`, where the auth gate owns
      the failure so the attempted path survives.
- [ ] `/login` — a single `<a href>` to `{API}/api/v1/auth/google/login`. Renders the
      `?error=` banner for
      `cancelled` | `login_failed` | `server_error`, and nothing for an unknown value.
- [ ] Auth gate: `GET /api/v1/me` is the session check. Pending → skeleton, error → redirect
      to `/login`, success → render with `role` available to the tree.
- [ ] `/onboarding` for the new-user redirect target.
- [x] Env: `VITE_API_URL` only. No secrets, no database URL, no app id.
- [ ] Base primitives per `ui-spec.md` → Components, in this order: Button, Badge (+ the SL
      square), Card, Tabs, Table, Stepper, then Banner, Sheet, Dialog, Skeleton, EmptyState.
      One accent button per screen, tap targets ≥ 44px, radius 12–16px, inline SVG icons only.
- [ ] Apply `ui-spec.md` → Foundations wholesale: the type scale, the 4px spacing ramp, the
      token usage map, `tabular-nums` on the numeric type classes, the focus ring, and the
      single permitted `color-mix` derivation for `ok`/`warn` tints.

## Implementation notes

**`league-fe` already has a working, tested client for all of this** — `src/api/axios.ts`,
`src/lib/csrf.ts`, `src/lib/errors.ts` (with tests covering numeric-code rejection and
`?error=` slug parsing), `src/hooks/useMe.ts`, `src/components/RequireAuth.tsx`. If the answer
**Keep these rather than rewriting**; they encode four non-obvious facts that are expensive
to rediscover.

**Those three facts, stated once:** (1) the login link must be a real navigation — XHR cannot
follow the 302 to Google; (2) error codes are JSON **strings** — a numeric `40101` must degrade
to INTERNAL rather than be coerced, or a backend regression passes silently; (3)
`/api/v1/me` must be exempt from the global 401 redirect or the gate loses the path it was
going to return to.

A fourth fact was retired with `app-id`: the login URL no longer carries a query param, which
is why `getGoogleSignInURL()` is now a bare `new URL(...).toString()`.

**Sign-in is cross-origin, so cookies need care.** `SameSite=Lax` works because Google's
redirect back is a top-level navigation, and all fetching is client-side, so the browser
attaches `sid` itself once `withCredentials` is set.

**Tokens, not hexes, in components.** Put every colour in the CSS-variable layer up front;
retrofitting after four screens exist is the expensive order.

## Verify
- `pnpm build` and `pnpm test` pass.
- Visiting any gated route while signed out lands on `/login`.
- Clicking "Sign in with Google" reaches Google's own domain (check the address bar), and
  completing it returns to `/`; a brand-new account lands on `/onboarding`.
- Reloading after sign-in stays signed in (the cookie survives) with no token in
  `localStorage` — check Application → Local Storage is empty of auth.
- `/login?error=cancelled` shows a banner; `/login?error=teapot` shows none.
- Devtools Network: no request carries an `app-id` header, every POST carries
  `X-CSRF-Token`, GETs show no preflight, and there are no CORS errors.
- Toggling the theme switches both palettes with no unstyled flash, and `system` is the
  default on a fresh profile.
