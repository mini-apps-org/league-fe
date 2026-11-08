# Phase 1 — The designed login screen

**Status: done, 2026-11-07.** `/login` rebuilt with the mobile column and the ≥1024px
two-column brand layout, Google's official mark, the legal line, and placeholder `/rules`
and `/privacy` outside the gate.

## Goal
`/login` looks like the product rather than a bare card, at both breakpoints, in both themes.

## Tasks
- [x] **Mobile**: full-height centred column — an 88px app mark with "8", "Billiard League" at the
      display size, a muted tagline; the Google button sitting near the bottom at 56px tall,
      radius 14, `card` background with an `inputLine` border; a 12px muted legal line beneath
      it linking to `/rules` and `/privacy`.
- [x] **Desktop ≥1024px**: two columns. Left, an `accentSoft` brand panel with the mark, the
      headline "Run league night without the paper scoresheet.", three check-mark points and
      "Fall 2026 · 8-Ball Open". Right, a centred 400px card with "Sign in", a subtitle, the
      button and the legal line. The columns wrap rather than squash.
- [x] Google's **official** "Sign in with Google" button: the unmodified G mark from Google's
      branding assets, neutral button style, label "Continue with Google". Do not redraw it.
- [x] Placeholder `/rules` and `/privacy` routes, outside the auth gate.
- [x] The existing `?error=` banner keeps its three slugs and its behaviour: nothing rendered
      for an unknown value.
- [x] Spinner on the button after a click, and it stays disabled.
- [x] All copy through i18n, both bundles.

## Implementation notes

**The Google mark is a deliberate palette exemption, and the only one.** `ui-spec.md` says no
colour outside the 15 tokens; Google's branding terms require the unmodified four-colour mark
beside "Sign in with Google". Taking the official asset settles the open question that has been
carried since the spec was written — record the exemption next to it so the next reader does
not "fix" it.

**It stays an `<a href>`, not a `<button onClick>`.** Sign-in is a full-page navigation: XHR
cannot follow the 302 to Google, and the user must see Google's own origin in the address bar.
The spinner is cosmetic — the navigation is already leaving — so it must not swallow the click.

**`/rules` and `/privacy` must sit outside the gate.** They are linked from the signed-out
login screen, so gating them would bounce a user to `/login`, which is where they already are.

**This phase depends on nothing** — no endpoint, no schema. It is the first thing a new user
sees and the only screen that is entirely self-contained, which is why it goes first.

## Verify
- 390px and 1024px+, both themes: no horizontal scroll, contrast ≥ 4.5:1, targets ≥ 44px.
- `/login?error=cancelled` shows its banner; `?error=teapot` shows nothing.
- The Google mark renders at its official proportions and is not recoloured by the theme.
- `/rules` and `/privacy` load while signed out.
- Clicking the button disables it and leaves for Google.


---

## Outcome, 2026-11-07

### Files
`src/components/auth/` — `GoogleMark.tsx` (the official four-colour G, unmodified),
`GoogleSignInButton.tsx`, `AppMark.tsx`, `LegalLine.tsx`, `LegalPageLayout.tsx`.
`src/pages/auth/LoginPage.tsx` rewritten; `src/pages/RulesPage.tsx` and `PrivacyPage.tsx`
added and routed outside `RequireAuth`.

### A contrast failure found by computing it, not eyeballing it

The design calls for an `accentSoft` brand panel. Using `accent` as its text colour gives
**3.93:1 in light mode** — acceptable for the 30px headline as large text, but **below 4.5:1
for the 16px check-mark points**. The panel now uses `foreground` for body copy (13.1:1) and
keeps the accent on the check marks themselves. Dark mode passed either way (5.2:1), so this
would have shipped looking fine to anyone testing in dark.

Measured, both themes: `foreground` 13.1 / 12.9, `muted-foreground` 4.62 / 5.71.

### Decisions

- **The brand panel is desktop-only.** On a phone the headline and three points would push
  the Google button below the fold, and the button is the only thing anyone opened this
  screen to tap.
- **The heading swaps by breakpoint** — "Billiard League" with the app mark on mobile, "Sign in"
  in the 400px card on desktop, where the brand panel already carries the identity.
- **The legal sentence is one i18n key** with `<rules>` and `<privacy>` placeholders, through
  `<Trans>`, so a translator can reorder the links. Three concatenated fragments would freeze
  English word order into every locale.
- **The pending state cannot block the click.** It is an `<a>`, the navigation is already
  leaving, and `preventDefault` would break sign-in entirely. The spinner exists only so a
  second tap does not look unresponsive.
- `app.name` changed from "League" to "Billiard League", which also renames the header.

### Verify — passing
- `pnpm typecheck`, `pnpm lint --max-warnings=0`, 42 tests, `pnpm build`.
- Generated CSS confirmed for the non-obvious utilities: `size-22` → 88px,
  `lg:w-100` → 400px, `rounded-[14px]` → `border-radius:14px`.
- Google's four brand hexes survive the build — they are inline SVG attributes, not class
  strings, so the no-hex lint rule does not apply and the exemption is recorded in the file.
- Dev server: `/login`, `/rules` and `/privacy` all 200, and every new module compiles.

### Not verified
Nobody has looked at it in a browser. Spacing, the mark's optical size and the two-column
balance all need a real viewport — and the artboards need comparing against it.
