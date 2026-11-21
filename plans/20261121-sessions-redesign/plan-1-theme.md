# Phase 1 — Theme tokens and font

**Status: done, 2026-11-21.** See the Outcome section for where the build differs from these tasks.

## Goal

The app takes the design's palette, font and radius through `src/index.css` alone. Every stock
shadcn primitive picks the new theme up unchanged.

## Tasks

- [ ] In `src/index.css`, replace the "Clean blue theme" values with the design's palette.

      | Token | Light | Dark |
      |---|---|---|
      | background | #FFFFFF | #101318 |
      | foreground | #1A1C21 | #E8EBF0 |
      | card | #FFFFFF | #171B22 |
      | muted | #F5F7FA | #1F242D |
      | muted-foreground | #5A6272 | #9AA3B2 |
      | border | #E3E8F2 | #2A303B |
      | input | #CBD3E1 | #39404D |
      | primary | #017D73 | #3FBFAE |
      | primary-foreground | #FFFFFF | #04201D |
      | primary-soft | #E6F4F2 | #0F2E2B |
      | highlight | #FEC514 | #FEC514 |
      | highlight-soft | #FFF6D6 | #3A3010 |
      | highlight-foreground | #5C4500 | #FEDF7A |
      | destructive | #BD271E | #F2796F |
      | destructive-soft | #FBEDEC | #3A1C1A |
      | ring | primary at 35% | primary at 40% |
      | sidebar | #FAFBFD | #13171D |

- [ ] Map shadcn's own variables onto these tokens:
  - `--accent` and `--accent-foreground` take `muted` and `foreground`, so hover surfaces stay
    neutral.
  - `--secondary` takes `muted`.
  - `--sidebar-accent` takes `primary-soft`, and its foreground takes `primary`.
  - `--sidebar-primary` takes `primary`.
  - `--sidebar-border` takes `border`.
- [ ] Register `primary-soft`, `highlight`, `highlight-soft`, `highlight-foreground` and
      `destructive-soft` in `@theme inline`, so `bg-primary-soft` and the others exist.
- [ ] Remap the legacy app tokens, which existing league components still use:

      | Legacy token | New value |
      |---|---|
      | `--ok` | `primary` |
      | `--ok-soft` | `primary-soft` |
      | `--warn` | `highlight-foreground` |
      | `--warn-soft` | `highlight-soft` |
      | `--chip` and `--sunken` | `muted` |
      | `--line` | `border` |
      | `--input-line` | `input` |
      | `--text-2` | `foreground` |

      Mark them in a comment as legacy, to be removed as screens are rebuilt.
- [ ] Set `--radius: 0.5rem`.
- [ ] Swap the font: `pnpm add @fontsource/be-vietnam-pro`, then `pnpm remove @fontsource/inter`.
      Import weights 400, 500, 600 and 700, and set
      `--font-sans: 'Be Vietnam Pro', system-ui, sans-serif`.
- [ ] Restyle the badges in `src/lib/status-colors.ts` to the design. Each status is a colour
      class plus a dot colour:
  - **draft:** `border-input text-muted-foreground` on the stock `outline` badge
  - **in progress:** `bg-highlight-soft text-highlight-foreground`, with a highlight dot and a
    soft ring
  - **complete:** `bg-primary-soft text-primary`
  - **cancelled:** `bg-destructive-soft text-destructive`
- [ ] `StatusBadge` and `SessionStatusBadge` render a stock `Badge` with the colour class and a
      `size-1.5 rounded-full bg-current` dot.
- [ ] `CLAUDE.md` Palette section: tokens come from the Sessions Redesign artifact (link). The
      legacy names are aliases.

## Verify

- `/dev/components` renders every primitive in the new palette, in light and dark.
- Select, dropdown and menu hovers stay neutral, not yellow.
- Vietnamese copy (switch the language to `vi`) renders in Be Vietnam Pro, with no fallback
  glyphs.

## Outcome, 2026-11-21

- **`src/index.css`**
  - Rewritten to the design's palette in light and dark. shadcn's `accent` and `secondary` are
    `muted`.
  - New brand tokens: `primary-soft`, `highlight`, `highlight-soft`, `highlight-foreground` and
    `destructive-soft`.
  - The legacy names alias the new palette.
  - `--radius` is `0.5rem` and `--radius-card` is 12px, matching the design's cards. Body text
    is 14px, as in the design.
- **Font:** `@fontsource/be-vietnam-pro` replaces `@fontsource/inter`.
- **Status badges:** `src/lib/status-colors.ts` now maps neutral, progress, done and danger to a
  badge variant plus colour and dot classes. New `StatusDotBadge` renders them. `StatusBadge`
  and `SessionStatusBadge` use it, and `ReasonChip` takes the progress colours for "unpaid".
- **`CLAUDE.md`:** the Palette section points at the redesign.
- **Checks:** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (104 tests).
- **Not verified:** I didn't look at it in a browser. Check `/dev/components` and
  `/admin/sessions` in light and dark, and that menu and select hovers stay neutral.
