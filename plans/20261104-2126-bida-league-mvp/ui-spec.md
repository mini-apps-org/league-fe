# UI Spec — Billiard League MVP

## What this is, and how much to trust it

A buildable specification for the six screens, derived from the kickoff prompt's screen
descriptions, domain rules and 15-token palette. **It is not a transcription of the
artboards.** The design artifact
(`claude.ai/code/artifact/22335122-0a40-471b-bd57-3308c6cebe0d`) cannot be read as text from a
terminal — its published page is only the design tool's runtime shell, its asset store is
empty, and its database returns no documents — so everything below that the prompt did not
state is an engineering decision made to be consistent, accessible and quick to build.

Where this spec and the artboards disagree, **the artboards win.** Reconcile before phase 5
starts; the list of things most likely to differ is in [Open to the artboards](#open-to-the-artboards).

Phases 5, 6, 7 and 8 all build against this file. Phase 4 builds [Foundations](#foundations)
and [Components](#components).

---

## Foundations

**Implementation note, 2026-11-06.** The 15 tokens are mapped onto shadcn's semantic layer in
`src/index.css` rather than living beside it, because the installed primitives already consume
`bg-card`, `text-muted-foreground` and `border-border` — remapping underneath them re-skins
everything at once. Two mappings are worth memorising: shadcn's **`primary` is our `accent`**
(the one blue button per screen) and shadcn's **`accent` is our `accentSoft`** (its
hover/selected tint). The six tokens shadcn has no slot for are exposed directly:
`bg-sunken`, `bg-sel-row`, `bg-chip`, `text-text-2`, `text-ok`, `text-warn`. Merge classes with
`cn` imported from the **`cn` package** — `@/lib/utils` does not exist here despite
`components.json` naming it.

### Type scale

One family, Inter, weights 400/500/600/700. Nothing else.

| Name | Size / line-height | Weight | Used for |
|---|---|---|---|
| `score` | 30 / 36 | 700 | Night score, team score strip |
| `title` | 20 / 28 | 600 | Screen title, player name in a panel |
| `subhead` | 18 / 26 | 600 | Card titles, section heads in a sheet |
| `body` | 16 / 24 | 400 | Row text, player names, input text |
| `body-strong` | 16 / 24 | 500 | Table numerics, selected row text |
| `small` | 14 / 20 | 400 | Secondary values, reason text, helper copy |
| `meta` | 12 / 16 | 500 | Labels, member IDs, badge text, timestamps |

**Every numeral that can change in place carries `font-variant-numeric: tabular-nums`** —
scores, SLs, races, games, innings, defensive shots, points. Set it on the token classes for
`score`, `body-strong` and `meta` rather than per component.

Sentence case throughout. No uppercase transforms, including table headers.

### Spacing, radius, borders

- **Spacing**: 4px base. Use 4 / 8 / 12 / 16 / 20 / 24 / 32 only.
- **Screen padding**: 16px mobile, 24px at ≥1024px.
- **Card padding**: 16px. **Gap between cards**: 12px.
- **Radius**: cards and sheets 16px · buttons, inputs, steppers, segments 12px · badges and
  chips full pill · SL square 12px.
- **Borders**: 1px `line` for structure and dividers; 1px `inputLine` for anything that
  accepts input. **No shadows and no gradients** — depth comes from `card` on `bg`, and from
  `sunken` for recessed strips.
- **Minimum touch target 44×44px.** A visually smaller control gets an invisible padded hit
  area, never a smaller target.

### Token usage map

Fifteen tokens, each with one job. A component that needs a sixteenth colour is a spec bug —
raise it rather than inventing a hex.

| Token | Applied to |
|---|---|
| `bg` | Page background |
| `sunken` | Recessed strips: score strip, verdict strip, opponent panel, desktop table head |
| `card` | Cards, list rows, sheets, sticky action bar, header |
| `selRow` | The selected roster/candidate row |
| `chip` | Week chips (unselected), segment track, SL square, skeletons, disabled controls |
| `line` | Card borders, row dividers, header/action-bar hairlines |
| `inputLine` | Input, textarea, stepper and select borders |
| `text` | Primary text, headings, values |
| `text2` | Secondary values, reason text, inactive segment label |
| `muted` | Labels, member IDs, meta lines, placeholders, disabled text, empty-state copy |
| `accent` | Primary button fill, links, selected chip text, focus ring |
| `onAccent` | Text and icons on an `accent` fill |
| `accentSoft` | Selected chip fill, info banner fill, race badge fill, selected SL ghost |
| `ok` | Winner name, "Submitted" badge, positive verdict |
| `warn` | Blocked reasons, error banners, "at cap" state |

**The one permitted derivation.** The palette has `accentSoft` but no soft `ok` or `warn`, and
a blocked row needs a tint. Derive it, never hand-pick it:

```css
background: color-mix(in oklab, var(--warn) 12%, var(--card));
```

Only `ok` and `warn`, only at 12%, only as a fill behind their own text colour. Everything
else uses a token as given.

### Contrast

All fifteen tokens were checked as text on `card` in both themes and clear 4.5:1 — including
the two that usually fail, `muted` (7.0:1 dark, 5.2:1 light) and `accent` (6.9:1 dark, 4.6:1
light). The two combinations to re-check whenever a token moves:

- `onAccent` on `accent` — 4.7:1 in light, the tightest pair in the system.
- `muted` on `chip` (disabled controls) — do not let disabled state be expressed as opacity on
  top of this, which would push it under 4.5:1. **Disabled = `chip` fill + `muted` text**, not
  `opacity`.

### Motion and focus

- State changes 150ms ease-out. Sheet enter 200ms. Nothing else animates.
- `@media (prefers-reduced-motion: reduce)` → transitions to 0ms, skeleton pulse off.
- **Focus**: 2px `accent` ring at 2px offset, on `:focus-visible`, never removed. It must be
  visible against `card`, `chip` and `accent` fills alike.

### Icons

lucide-react, 20px default, 2px stroke, `currentColor`. 16px only in desktop dense table rows.
Every icon-only control carries an `aria-label`. No emoji anywhere, per the prompt.

**Imported from `src/lib/icons.ts`, never from `lucide-react` directly** — a project rule, so
that swapping icon library touches one file. Add the icon to that module first. Note `History`
does not exist in lucide-react 1.48; `Clock` stands in for the skill-level history section.

The one exception to lucide: the Google mark on the sign-in link, which is an inline brand SVG
— see [`/login`](#login).

---

## Components

Build order within phase 4: Button, Badge, Card, Tabs, Table, Stepper, then the shells
(Banner, Sheet, Dialog, Skeleton, EmptyState).

### Button

| Variant | Fill | Text | Border | Used for |
|---|---|---|---|---|
| `primary` | `accent` | `onAccent` | none | The single main action on a screen |
| `secondary` | `card` | `text` | 1px `line` | Cancel, Transfer, paired actions |
| `ghost` | transparent | `text2` | none | "Add paid member", low-weight actions |
| `icon` | transparent | `text2` | none | Header controls, 44×44, `aria-label` required |

Sizes: `lg` 48px (full-width CTA) · `md` 44px · `sm` 36px — `sm` is permitted **only** in a
desktop table row, never as the sole control on mobile.

States: hover `color-mix(in oklab, currentfill 92%, black)` on pointer devices only · active
scale none, fill one more step · focus-visible per [Focus](#motion-and-focus) · **disabled
`chip` fill + `muted` text + `aria-disabled`, not `opacity`** · loading shows a 16px spinner in
place of the label at the button's existing width, with `aria-busy="true"`.

**One `primary` per screen.** The prompt is explicit, so the audit is per route: Schedule has
none (cards are the action), Roster has "Start match", Put-up has "Confirm put-up", Result has
"Save result", Summary has "Submit night", Admin's panel has "Save skill level", Login has the
Google link.

### Badge

Pill, 24px tall, 8px horizontal padding, `meta` type.

| Variant | Fill | Text | Example |
|---|---|---|---|
| `neutral` | `chip` | `text2` | "Scheduled" |
| `accent` | `accentSoft` | `accent` | "Race 5–4", "SL used 20/23" |
| `ok` | `color-mix(ok 12%, card)` | `ok` | "Submitted" |
| `warn` | `color-mix(warn 12%, card)` | `warn` | "Would break 23" |

**SL square** is its own primitive, not a badge: 28×28, radius 12, `chip` fill, `text`,
`body-strong` tabular, centred. It appears in every roster, candidate and scoresheet row, so it
must be one component.

### Tabs (Home / Away)

Segmented control, not a dropdown — the prompt specifies tabs. Full width, 44px tall, `chip`
track at radius 12 with 2px inset padding. Active segment: `card` fill, 1px `line`, `text`,
weight 500. Inactive: `text2`, no fill. `role="tablist"` / `role="tab"` / `aria-selected`;
Left/Right arrows move between tabs; the panel is `role="tabpanel"` and labelled by its tab.

### Table

A real `<table>` — `<caption>` (visually hidden), `<thead>`, `<th scope="col">`. Header row:
`meta`, `muted`, sentence case, 1px `line` beneath, `sunken` fill on desktop and no fill on
mobile. Body rows: 44px minimum height, 1px `line` divider, last row no divider. **Numeric
columns right-aligned and tabular**; the text column left. `aria-sort` on any sortable header.
Selected row: `selRow` fill.

Mobile roster columns are tight at 390px, so the player column stacks: name on line 1
(`body`), member ID on line 2 (`meta`, `muted`).

### Stepper

The most-touched control in the app. Row: `[−]` value `[+]`.

- Buttons 44×44, radius 12, 1px `inputLine`, `minus`/`plus` icon 20px.
- Value: a real `<input type="number" inputmode="numeric">`, 56px wide, centred, `title` type
  tabular, 1px `inputLine`, radius 12 — typed input allowed and validated on blur.
- A capped stepper shows its ceiling beside the value as `muted` `small`: `/ 4`.
- `−` disabled at 0; `+` disabled at max. **Games max = that player's race, from the server's
  snapshot** — innings and defensive shots are uncapped non-negative integers.
- Labels: the input is labelled by the field name; the buttons carry
  `aria-label="Decrease games won for {player}"` / `Increase…`. Changes announce via the input's
  own value, so no extra live region.

### Banner

Full width, radius 12, 12px padding, 1px border, icon 20px + text. `info`: `accentSoft` fill,
`accent` border and icon, `text` copy. `error`: `color-mix(warn 12%, card)` fill, `warn` border
and icon. Dismissible only when the error is advisory; a terminal error keeps its banner and
offers Retry. **Never renders the backend's `message` field** — copy comes from the code map in
[Errors](#errors-and-empty-states).

### Sheet / Panel

The same content in two shells, by breakpoint. **Mobile**: bottom sheet (`vaul`), max 90vh,
radius 16 top corners, 32×4 `line` grab handle, `card` fill, scrim `rgb(0 0 0 / 0.5)`, swipe or
backdrop to dismiss, focus trapped, Escape closes. **≥1024px**: a static right rail, 400px
wide, `card` fill, 1px `line` on its left edge, no scrim, no trap — it is part of the page.

### Confirmation sheet

**Corrected 2026-11-06:** this was specified as a centred Dialog, but
`.claude/rules/shadcn.md` requires "Confirmations are sheets too, never `window.confirm`". So
Submit night confirms in the same `vaul` bottom sheet as every other panel: title `subhead`,
body `small` `text2`, then Cancel (`secondary`) and the `primary`, stacked full-width on
mobile. Focus starts on Cancel. **Never `window.confirm`.**

### Skeleton and EmptyState

**Skeleton**: `chip` fill at the real component's radius and height, 1.5s pulse. Lists render
three. Skeletons everywhere except inside buttons, which use the spinner.

**EmptyState**: centred, 32px `muted` lucide icon, `subhead` line, one `small` `muted` line,
and a CTA **only** where the user can act. 48px vertical padding. An empty state is never a
blank region and never a permanent spinner.

### App shell

**Header** 56px, `card`, 1px `line` bottom, sticky. Left: back chevron (44×44, `aria-label`
naming the destination) then the screen title (`title`, truncating to one line). Right: theme
toggle (`icon`, `aria-pressed`, sun/moon/monitor for light/dark/system) and account menu.

**Sticky action bar** (mobile only): `card`, 1px `line` top, 12px padding plus
`env(safe-area-inset-bottom)`, holding one full-width `lg` button. The scroll container gets
matching bottom padding so the last row is never trapped under the bar.

---

## Screens

### `/login`

Centred column, max-width 360px, vertically centred, 24px padding. No header, no theme toggle.

1. App name, `title`.
2. One `small` `muted` line: "Sign in to run your team's night."
3. Error banner, only for a known `?error=` value.
4. The sign-in control: **an `<a href>` styled as a `primary` `lg` button, full width** —
   never a `<button onClick>`, because XHR cannot follow the 302 to Google and the user must
   see Google's origin in the address bar. `href` is
   `{API}/api/v1/auth/google/login`, with no query parameters.

| `?error=` | Banner copy |
|---|---|
| `cancelled` | Sign-in was cancelled. |
| `login_failed` | We couldn't complete sign-in. Try again. |
| `server_error` | Something went wrong on our side. Try again in a moment. |
| anything else | **Render nothing** — no banner, no fallback text. |

The Google mark is the one non-lucide icon: the official multi-colour G as an inline SVG, 20px,
left of the label with 12px gap. **Its four brand colours are exempt from the palette** —
Google's branding terms require the unmodified mark beside "Sign in with Google". Flag at review
so the exemption is a decision, not a leak.

### `/` — Schedule

**Mobile**

```
┌─────────────────────────────────┐
│ Schedule                  ☾  ◍ │  header 56
├─────────────────────────────────┤
│ Fall 2026 · 8-Ball Open      ⌄ │  session select, 44
│                                 │
│ ‹ W8 │ W9 │[W10]│ W11 │ W12 ›  │  week chips, 36, h-scroll
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 03209 Corner Pocket Crew    │ │  body-strong
│ │ 03214 Eight Ball Bandits    │ │
│ │ Saigon Cue Club · Tue 19:30 │ │  meta / muted
│ │                 [Scheduled] │ │  badge
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 03211 Rack Attack       3–2 │ │  score, right
│ │ 03207 Side Pocket Social    │ │
│ │ Saigon Cue Club · Tue 19:30 │ │
│ │                 [Submitted] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

- **Session select**: full-width 44px row, `chip` fill, radius 12, 12px padding,
  `chevron-down`. A native `<select>` on mobile; a listbox only if the artboards demand it.
- **Week chips**: horizontally scrolling row, 36px pill, 8px gap, `chip`/`text2` unselected and
  `accentSoft`/`accent` weight 500 selected. Scroll snap, and the selected chip scrolls into
  view on mount. Bleeds to the screen edge via `-16px` margin and `16px` padding so the row
  reads as scrollable.
- **Fixture card**: the entire card is one `<a>` to `/matches/[id]` — minimum 88px tall, so the
  target is far above 44px. 16px padding, radius 16, 1px `line`. Home team on the first line,
  away on the second, each as `{number} {name}` with the number in `muted` `meta` and the name
  in `body-strong`. Score (`score` type, right-aligned, vertically centred across both lines)
  appears only once a result exists. Meta line last: venue · weekday, time.
- **Status badge**: `scheduled` → `neutral` "Scheduled" · `in_progress` → `accent` "In
  progress" · `submitted` → `ok` "Submitted".
- **No `primary` button on this screen.** The cards are the action.
- **Empty** (week with no fixtures): `calendar-off`, "No fixtures this week", "Try another week
  or session." No CTA.
- **Loading**: three 88px skeleton cards. Chips and the select render immediately from cached
  season data where available.

**≥1024px**: content max-width 960px, centred, 24px padding; fixture cards in a two-column grid
with 16px gaps. Header gains no navigation — there are six screens and the back chevron is
enough.

### `/matches/[id]` — Team roster

**Mobile**

- Header title `{home number} vs {away number}`; meta line beneath in the body: venue · full
  date and time · status badge.
- **Score strip**, only once any result exists: `sunken`, radius 12, 16px padding, both numbers
  in `score` with team numbers in `meta` `muted` beneath, split left/right.
- **Tabs**: Home | Away, defaulting to the side the signed-in captain belongs to, else Home.
- **"Add paid member"** — `ghost` button with `user-plus`, right-aligned above the table.
  Captain of this night only, and only while `status` is not `submitted`.
- **Roster table**: columns Player (name + member ID stacked) · SL · MW/MP · Pts. SL as the SL
  square; MW/MP as `3/5` tabular; Pts tabular. A player with no matches shows `0/0` and `0`,
  never blank and never `NaN`.
- **Sticky action bar**: `primary` "Start match" → `/matches/[id]/put-up`. Shown only to this
  night's captain and admins. **A `player` role sees no bar at all** — not a disabled button,
  because a control that can never be enabled is noise. The backend enforces this regardless.
- **Empty** (roster with no players): `users`, "No players on this roster", plus the add CTA for
  a captain.

**≥1024px** — the prompt's layout: schedule left, both rosters right.

```
┌──────────────┬────────────────────────────────────────────────┐
│ Week 10      │ 03209 Corner Pocket Crew vs 03214 Eight Ball   │
│              │ Saigon Cue Club · Tue 10 Nov 19:30 [Scheduled] │
│ ┌──────────┐ │                              [ Start match ]  │
│ │ 03209 ·· │ │ ┌───────────────────┬───────────────────────┐  │
│ │ 03214    │ │ │ Home              │ Away                  │  │
│ └──────────┘ │ │ Player  SL MW/MP P│ Player  SL MW/MP P    │  │
│ ┌──────────┐ │ │ Minh    5   3/5  7│ Tuan    4   2/4  5    │  │
│ │ 03211    │ │ │ …                 │ …                     │  │
│ │ 03207    │ │ └───────────────────┴───────────────────────┘  │
│ └──────────┘ │                                                │
│  320px       │  fluid, max 1200 total                         │
└──────────────┴────────────────────────────────────────────────┘
```

Left rail 320px, `sunken`, 1px `line` right edge, holding compact fixture cards for the week
with the open one in `selRow`. Right pane: the night header with the CTA inline (**not** sticky
— there is no thumb reach problem at this width), then the two rosters side by side in one card
split by a 1px `line`. The Home/Away tabs disappear; both are visible, so a tab control would be
a lie.

### `/matches/[id]/put-up`

```
┌─────────────────────────────────┐
│ ‹  Match 3 of 5                 │  title
│    Away put up first            │  small / muted
├─────────────────────────────────┤
│              [ SL used 20/23 ]  │  badge accent → warn at cap
│ ┌─────────────────────────────┐ │
│ │ AWAY PUT UP                 │ │  meta / muted, sunken panel
│ │ Tuan Nguyen          [ 4 ]  │ │  body-strong + SL square
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Minh Le        [5]    3–4 ✓ │ │  selRow + accent check
│ │ 95007620                    │ │
│ ├─────────────────────────────┤ │
│ │ Hoa Pham       [3]    2–3   │ │
│ │ 95007641                    │ │
│ ├─────────────────────────────┤ │
│ │ Dung Tran      [6]          │ │  chip fill, muted text
│ │ 95007655   [Would break 23] │ │  warn badge
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [       Confirm put-up       ]  │  sticky, primary lg
└─────────────────────────────────┘
```

- **Header** "Match {n} of 5"; subtitle states who puts up first this match, read from the
  row's `first_put_up` — **never recomputed client-side**.
- **SL-used badge**: `accent` variant reading "SL used {sum}/{cap}", switching to `warn` when
  the sum equals the cap. The number is display only; the block decision belongs to the server.
- **Opponent panel**: only when the opposing side has already put up. `sunken`, radius 12, 12px
  padding: `meta` `muted` label, then their player's name and SL square. Absent — not
  placeholdered — when this side goes first.
- **Candidate rows**: 56px minimum, name `body` + member ID `meta` `muted` stacked, SL square,
  then the race preview right-aligned as `{mine}–{theirs}` tabular `small`. **The race preview
  only renders when the opponent has already put up**; when this side goes first the race is
  genuinely unknown, so the cell is empty rather than showing a guess.
- **Selected**: `selRow` fill, `check` icon 20px in `accent`. Single select; the rows are
  `role="radio"` inside a `role="radiogroup"` labelled by the header.
- **Blocked**: `chip` fill, name in `muted`, a `warn` badge carrying the reason. `aria-disabled="true"`
  and **kept in the tab order** so a screen-reader user hears why their best player is
  unavailable — per the prompt, grey out, never hide. Reason copy comes from the server's
  machine-readable code:

| Server reason | Badge copy |
|---|---|
| `would_break_23` | Would break 23 |
| `already_put_up` | Already playing tonight |
| `not_on_roster` | Not on this roster |

- **Confirm** → `POST /api/v1/team-matches/{id}/put-up`, then route to
  `/matches/[id]/result/{order}`. Disabled until a selectable player is chosen.
- **Rejection** (the other captain picked first, or the list was stale): `error` banner at the
  top, list refetched, selection cleared, button re-enabled. Never a dead button and never a
  stuck spinner.

### `/matches/[id]/result/[order]`

- **Header** "Match {n} of 5", subtitle naming both players with their SL and race: "Minh (SL 5)
  races to 4 · Tuan (SL 4) races to 3". These come from the row's snapshot, not from
  `players.current_sl`.
- **Two games cards**, one per player: `card`, 16px padding, name `body-strong`, `meta` `muted`
  "Games won", capped stepper centred with `/ {race}` beside it.
- **Innings**: one stepper, per match, uncapped. Label "Innings".
- **Defensive shots**: two steppers, one per player, uncapped. The asymmetry — innings per
  match, defensive shots per player — matches the schema's `innings` / `home_def_shots` /
  `away_def_shots` and is easy to get backwards; the labels must make it obvious.
- **Verdict strip**: `sunken`, radius 12, 12px padding, updating live from `src/lib/rules.ts`.
  Winner's name in `ok`: "Minh wins 4–2 · 2–1 points". Before either player reaches their race:
  `muted` "Enter games to see the result."
- **"Save result"**, `primary` `lg`, sticky. Disabled until the Zod schema parses *and* exactly
  one player has reached their race. On success, render points from the **response**, not the
  local preview, then route to the next put-up or to the summary after match 5.
- Both players reaching their race is unreachable through the UI by construction — the caps make
  it impossible, rather than rejecting it on save.

**≥1024px** — the whole night as one scoresheet, per the prompt:

```
┌────────────────────────────────────────────┬──────────────────┐
│ #  Home        SL  G   Away        SL  G  P│ Put up — match 4 │
│ 1  Minh        5   4   Tuan        4   2 2─1  ──────────────── │
│ 2  Hoa         3   1   An          6   3 0─3│ [ SL used 17/23 ]│
│ 3  Dung        6  [4]▲ Bao         5  [2]▲ │ Minh   [5]  3–4  │
│ 4  —           —   —   —           —   —   │ Hoa    [3]  2–3  │
│ 5  —           —   —   —           —   —   │ …                │
│                              Total  3 – 2  │ [ Confirm ]      │
└────────────────────────────────────────────┴──────────────────┘
```

Scoresheet table on the left, five rows always present (future matches as `—`), inline steppers
on the current row only, `aria-sort` absent because the order is fixed. Put-up panel in the
360px right rail. Total row in `sunken` with `score` numerals. The CTA count still holds: one
`primary` in the rail.

### Night summary (`/matches/[id]` once five results exist)

- **Score strip** in `score` with both team numbers and the status badge.
- **Five rows**: match number, both players with SL squares, games, points, winner's name in
  `ok`. The two halves of the night's points sum to 15 — five matches at three points.
- **"Submit night"**, `primary` `lg`, for this night's captain while `status` is not
  `submitted`. Opens the dialog: title "Submit this night?", body "Scores are final for
  captains after submitting. An admin can still make corrections.", actions Cancel / Submit.
- **After submit**: badge flips to `ok` "Submitted", the CTA is replaced by a `small` `muted`
  line "Submitted by {name} · {time}". A captain sees no editable control; **an admin on the
  same night still does** — the read-only decision is role-dependent, not status alone.

### `/admin/players`

**Mobile**

- **Search**: 44px input, `search` icon left, `x` clear button right once filled, placeholder
  "Name or member ID". 300ms debounce, querying from 2 characters.
- **Result rows**: name `body` + member ID `meta` `muted` stacked; right side SL square + team
  number in `meta` `muted`. Tap opens the sheet.
- **Sheet sections**, in this order:
  1. **Player** — name `title`, member ID and team `small` `muted`.
  2. **Skill level** — six 44×44 buttons, 2 through 7, radius 12, 8px gaps. Current value
     `accentSoft`/`accent`; the pending choice `accent`/`onAccent`; the rest `chip`/`text`.
     Beneath, a `small` `muted` race-change line against the reference opponent SL 5: "vs SL 5:
     races to 4 (was 3)". SL 5 is the reference because it is the middle of the 2–7 range.
     Rendered from `rules.ts` — the same mirror as the put-up preview.
  3. **Reason** — `small` label, two-row textarea, 1px `inputLine`, radius 12, and the helper
     "Required. Shown in this player's history." Required because `change_skill_level()`
     rejects a blank reason; validating only server-side would lose the admin's typing to a 400.
  4. **"Save skill level"**, `primary` `lg`, disabled until the SL differs from current **and**
     the trimmed reason is non-empty.
  5. **Transfer team** — `<select>` of the division's teams plus a `secondary` "Transfer".
  6. **History** — newest first: "4 → 6" `body-strong` tabular, reason `small` `text2`, "by
     {admin} · {date}" `meta` `muted`. Empty: "No changes yet." Append-only, so no row has any
     control on it.
- **Role**: admin only. A captain or player hitting the route gets the 403 state, and the
  backend refuses the writes independently of the route guard.

**≥1024px**: the full table on the left (Name, Member ID, SL, Team, Pts), selected row in
`selRow`, and the same panel content in the 400px static right rail. No sheet, no scrim.

---

## Errors and empty states

Every screen has all three of loading, empty and error. The error banner's copy is driven by
the **5-digit string** code — switch on the code, never the message, and never render the
backend's `message` to a user.

| Condition | Presentation |
|---|---|
| 401 anywhere | Redirect to `/login`. Terminal — there is no refresh endpoint. |
| 401 on `/api/v1/me` | The auth gate owns it, so the attempted path survives the redirect. |
| 403 | Banner: "You don't have permission to do that." No retry. |
| Put-up rejected (`would_break_23` on POST) | Banner: "That player can't be put up any more — the list has changed." Refetch the list. |
| Roster add, unpaid member | Banner: "That member isn't paid up for this division yet." Its own code, its own copy. |
| Any `5xxxx` | Banner: "Something went wrong. Try again." With a Retry button. |
| Network failure | Same as `5xxxx`; retrying recovers without a page reload. |
| Unknown code | The generic `5xxxx` copy. Never a raw code and never a blank screen. |

If the bilingual question in `plan.md` resolves to "keep `en`/`vi`", **every string in this
spec is a key** and the copy above is the `en` bundle. Decide before phase 5, because
retrofitting i18n across six screens is dramatically more expensive than starting with it.

---

## Open to the artboards

The decisions below are mine, not the designer's, and are the ones most likely to differ. Check
each against the artifact in a browser before phase 5 and correct this file in place.

1. **The type scale and spacing ramp** — plausible and internally consistent, but almost
   certainly not digit-for-digit what the artboards use.
2. **Fixture card anatomy** — whether the score sits right-aligned across both team lines or
   below them, and whether the status badge is top-right or bottom-right.
3. **Week chip labels** — "W10" versus "Week 10" versus a date range.
4. **Put-up row layout** — whether the race preview is a plain `3–4` or an `accent` badge, and
   whether selection is a check, a radio, or a filled row.
5. **The desktop scoresheet's column widths and whether points render as `2–1` or in two
   columns.**
6. **Empty-state illustrations** — this spec uses a lucide glyph; the artboards may have real
   artwork, which would change nothing structurally.
7. **The `color-mix` derivation for `ok`/`warn` tints** — if the artboards show soft success and
   warning fills, those are two more tokens and the palette table in the prompt is incomplete.
8. **Whether the Google mark appears on the sign-in link** at all, and the exact label.
