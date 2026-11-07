# Phase 9 — PWA, states, accessibility and deploy

**Status: done apart from what needs a real browser, 2026-11-07.** Manifest, 192/512 PNG
icons, theme-color per scheme, apple-touch-icon, `vercel.json` with the SPA rewrite, and a
service worker registered in production only. Every screen has loading, empty and error
states driven by the 5-digit code through `messageFor()`. Desktop layouts landed: two-column
fixtures, side-by-side rosters, and the night as a table.

**Still outstanding, all of it needing a browser or a host:** the Vercel deploy, a Lighthouse
run, axe, and real-device QA on iOS Safari and Android.

## Goal
The app installs on a phone, behaves on every screen it claims to support, and is deployed.

## Tasks
- [ ] Web app manifest with name, theme colour per the token palette, and the icon set.
      Installable; **no offline sync** in the MVP.
- [ ] Loading, empty and error states on every screen — schedule, roster, put-up, result,
      night summary, admin.
- [ ] A single error presentation driven by the 5-digit code, with a retry where retrying can
      help. Never render the backend's raw `message`.
- [ ] Accessibility pass: real buttons/links/labels, `aria-label` on icon-only controls,
      `aria-pressed` on toggles, `role="tab"`/`aria-selected` on the roster tabs, table
      semantics plus `aria-sort` on the scoresheet, contrast ≥ 4.5:1 in **both** themes.
- [ ] Verify at 360 / 375 / 390 / 430px and at 1024px+, in light and dark.
- [ ] Deploy to Vercel as a **static build**: `pnpm build` → `dist`, with a
      SPA rewrite so deep links like `/matches/:id` reach `index.html` instead of 404ing.
- [ ] Set `VITE_API_URL` in the Vercel project env.
- [ ] Point `league-be`'s `FRONTEND_URL` at the deployed origin — it allows exactly one.
- [ ] Walk the Definition of Done on a real phone.

## Implementation notes

**The deployed origin has to be set on both sides.** `league-be` allows exactly one CORS
origin (`FRONTEND_URL`). Deploying the frontend without updating it means a working local app
and a totally broken deployed one, with CORS errors that look like frontend bugs.

**A Vite SPA on Vercel needs an explicit rewrite.** Without `{"source": "/(.*)",
"destination": "/index.html"}` in `vercel.json`, every route except `/` 404s on hard load —
which looks like a router bug and is not one.

**Production cookies are stricter.** `league-be` adds the `__Host-` prefix and `Secure` when
`APP_ENV` is production, so the CSRF cookie is `__Host-csrf` there and plain `csrf` locally.
The reader must try the prefixed name first — the existing `league-fe` `lib/csrf.ts` already
does this; keep that behaviour.

**No offline sync, but a manifest still needs a service worker** for installability on some
browsers. Keep it trivial — a shell cache at most. A caching service worker plus a cookie
session is a good way to serve a signed-out shell to a signed-in user.

**Real-device QA is not optional for this app.** The whole product is a captain holding a
phone in a pool hall. Test iOS Safari and a mid-range Android, both with the keyboard open on
the result steppers.

## Verify
- Lighthouse: installable PWA check passes; the app can be added to the home screen and
  launches standalone.
- Every screen has a visible loading state, a distinguishable empty state, and an error state
  with a retry that works.
- Disconnect the network mid-flow: the error state appears; reconnecting and retrying recovers
  without a reload.
- axe reports no serious violations on any of the six screens, in both themes.
- Contrast checked on accent-on-background and muted-on-card in both themes.
- No horizontal scroll at 360px on any screen.
- On the deployed origin: sign in with Google and confirm no CORS error. (`40002` and `40303`
  are retired codes and can no longer appear.)
- The full Definition of Done, performed on a phone: sign in → open tonight's match → put up 5
  players under 23 → enter 5 results → see the team score → submit; then as an admin, change
  an SL and see it in history.


---

## Outcome, 2026-11-07

### Desktop layouts (deferred from phases 5 and 7, now built)

- **Schedule** — fixture cards in a two-column grid at `lg`.
- **Match** — tabs below `lg`; at `lg` both rosters side by side, because tabs naming one of
  two simultaneously visible panels would be a lie. Extracted `RosterPanel` so the two
  layouts share one implementation rather than duplicating the table.
- **Night** — the stacked list below `lg`, and `DesktopScoresheet` at `lg`: five rows, the
  current match highlighted in `sel-row`, and a total row in the `tfoot`.
- **The action bar is sticky only on a phone** (`lg:static`), where thumb reach is the reason
  for it in the first place.
- The app shell was capped at `max-w-3xl` (768px), which would have squashed both two-column
  layouts; it now widens to `max-w-6xl` at `lg`.

**Scope call: result entry stays its own screen at every width.** The design shows inline
entry in the desktop scoresheet, but the steppers are the same controls and duplicating them
inline would mean two code paths for the one write that must not go wrong. The desktop
scoresheet links to the entry screen instead. Worth revisiting once the flow has been used in
a real match.

### Service worker

Registered in production only — in dev it would cache Vite's module graph and serve stale
code after an edit. It caches **only** `/assets/*` and the icons: never HTML, never
`/api/v1`. The session is an HttpOnly cookie, so a cached shell or a cached `/me` would serve
one person's signed-in page to the next user of the device, and an MVP with no offline sync
has nothing to weigh against that risk.

### Accessibility pass

- Every icon-only control carries an `aria-label`, verified by scanning whole JSX elements
  rather than single lines.
- One focus treatment everywhere: a 2px accent outline at 2px offset on `:focus-visible`, so
  it is legible against `card`, `chip` and `accent` fills alike and a tap leaves no ring.
- Tables all carry a visually hidden `<caption>` and `<th scope="col">`.
- Blocked put-up rows stay in the tab order with `aria-disabled`, so the reason is announced.
- **Fixed:** the fixture card announced "…Bandits, venue, Scheduled, vs" — the "vs" trailing
  at the very end, away from the names it joins. It now sits before the away team.
- `jsx-a11y` passes at `--max-warnings=0`, and no JSX string is hard-coded.
