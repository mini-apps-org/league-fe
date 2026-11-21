# Plan: Sessions redesign and dashboard placeholder

## Goal

Rebuild the admin shell and the `/admin/sessions` screen to match the Claude design
[Sessions Redesign](https://claude.ai/artifact/H5CEqSxUJhtAB8d9Q3Msio), and add a placeholder
Dashboard page that the design links to but doesn't draw.

## Scope

**In:**
- The design's theme: colour tokens, Be Vietnam Pro, 8px radius.
- The app shell: sidebar, top bar with breadcrumbs, content width.
- Every Sessions page state the design shows:
  - list
  - loading
  - no sessions
  - no results
  - load error
  - create
  - field errors
  - duplicate name
  - edit
  - delete
  - no permission
- A Dashboard route and nav link, with a "coming soon" page.
- The two contract fields the design needs, `weekCount` and `hasSubmittedResults`, implemented in
  the MSW mock.

**Out:**
- Dashboard content, until it is designed.
- The session detail page (weeks and matches). That is Phase 3 of
  [20261120-session-match-crud](../20261120-session-match-crud/plan.md).
- New tests, unless asked for.

## Design review

**Works well:**
- The active-session stat card.
- Filter chips with "Clear all".
- Sortable headers with `aria-sort`.
- The "Showing X of Y" footer.
- A right sheet on desktop and a bottom sheet on mobile.
- Type-to-confirm delete, with a list of what the delete removes.
- A designed no-permission state.

**Resolved while building:**

1. **The brand yellow can't be shadcn's `--accent`.** Stock shadcn uses `bg-accent` for hover and
   focus in menus, selects and dropdowns, so using it would turn every hover yellow.
   - shadcn's `--accent` takes the design's `--muted`.
   - The yellow becomes new tokens: `--highlight`, `--highlight-soft`, `--highlight-foreground`.
   - Also new: `--primary-soft` and `--destructive-soft`.
2. **Whole-row click.** The name stays a real `<Link>`, so keyboard users can reach it. The row
   click is a convenience. The icon buttons stop propagation.
3. **New API fields.** "N weeks scheduled" and the submitted-results warning need `weekCount` and
   `hasSubmittedResults` on `LeagueSession`.
4. **Only one session can be active.** "X will stop being active" implies one active session per
   league. The mock enforces it. league-be doesn't yet (open question 3 of the CRUD plan).
5. **The form drops the name autofill.** The design uses a placeholder ("e.g. Fall 2026") and a
   Type control with no default. The name must be 3–60 characters, not 1–80.
6. **Sidebar breakpoint.** The design collapses the sidebar at 860px. We keep the app's `lg`
   (1024px), so the shell behaves the same on every page.
7. **No second font.** The error-code chip uses `font-mono` instead of loading JetBrains Mono.
8. **Active nav item.** The 3px left bar is a `before:` utility on `AppNavLink`. The sidebar
   primitive stays stock.

## Conventions

- **Primitives stay stock.** `src/components/ui` stays stock shadcn. The theme changes only
  `src/index.css` tokens (colour, font, radius). Call sites set layout and colour.
- **Forms** use react-hook-form with Zod and the shadcn `field` primitives.
- **No new tests** unless the user asks for them.

## Phases

| Phase | File | What it delivers |
|---|---|---|
| 1 | [plan-1-theme.md](plan-1-theme.md) | Palette tokens, brand tokens, Be Vietnam Pro, 8px radius, status badge colours |
| 2 | [plan-2-shell.md](plan-2-shell.md) | Sidebar brand, footer, counts and active bar; breadcrumb top bar; content width; visible `PageTitle` |
| 3 | [plan-3-dashboard.md](plan-3-dashboard.md) | `/dashboard` route, nav link and placeholder page |
| 4 | [plan-4-sessions-page.md](plan-4-sessions-page.md) | Stats, toolbar and chips, responsive sortable table, every list state |
| 5 | [plan-5-sheets.md](plan-5-sheets.md) | Responsive form and delete sheets, the design's validation, type-to-confirm |

Phase 1 comes first, because every later phase is checked against its colours. Phases 2 and 3 are
independent of 4 and 5.

**Status, 2026-11-21:** all five phases done. Nothing has been checked in a browser yet.

## Success criteria

- Side by side at 1280px and 375px, in light and dark, every state in the design's preview bar
  matches the running app (`pnpm dev`).
- `grep -r 'src/components/ui'` shows no edits beyond the CLI output.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.

## Open questions

1. What goes on the Dashboard? It needs its own design.
2. Should league-be enforce one active session per league, and return `weekCount` and
   `hasSubmittedResults` on the session list?
3. The sidebar footer shows a role label ("Super admin"). Should users with several roles see the
   highest one only? Today `/me` resolves SUPER_ADMIN > CAPTAIN > PLAYER.
