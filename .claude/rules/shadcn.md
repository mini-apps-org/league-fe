---
paths:
  - 'src/components/**'
  - 'src/pages/**'
  - 'src/index.css'
  - 'components.json'
---

# shadcn/ui Rules

These override the shared rules in `~/.claude/rules` where they conflict.

Style is `radix-nova` on Tailwind 4, with no `tailwind.config.ts`. Tokens live in `src/index.css`.

## Ownership

- The CLI owns `src/components/ui/` and may overwrite it. Do not edit it, except to retokenise to
  the palette in CLAUDE.md. Override at the call site with `className`.
- Check before adding: `pnpm dlx shadcn info`, `pnpm dlx shadcn docs <component>`.
- Add through the CLI (`pnpm dlx shadcn add <component>`), never by pasting source.
- Review the diff after `add`: the CLI generates class strings against its own defaults.

## Composition

- Compose an existing primitive before hand-rolling one.
- Panels are `BottomSheet` (`vaul`). Confirmations are sheets too, never `window.confirm`.
- Variants live in `cva` at the primitive. One-off layout belongs in `className`.
- Merge classes with `cn`, so consumer overrides win. Do not concatenate class strings.

## Styling

- `[lint]` No hex colours in class strings. Use the semantic tokens (`bg-surface`, `text-ink`,
  `border-line`, `bg-primary`). If no token fits, add one to `src/index.css` for both themes.
- Tailwind utilities over inline `style`. Safe-area padding works as an arbitrary value:
  `pb-[max(1rem,env(safe-area-inset-bottom))]`.
- The Nova button is 32–36px. Reach 44px at the call site with `size-11` or `h-11`.
- Hover styles stay behind `@media (hover: hover)`, which Tailwind 4's `hover:` already does.
- Icons come through `src/lib/icons.ts`. No emoji in the UI.
