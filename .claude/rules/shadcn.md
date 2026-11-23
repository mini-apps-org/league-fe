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

- `src/components/ui/` is stock shadcn (radix-nova), exactly as the CLI generates it. Only the
  colours are ours, through the tokens in `src/index.css` (`:root` and `.dark`).
- No custom variants, sizes or class changes inside the primitives, with one exception: the
  design's controls are 36px, so the default height is `h-9` instead of radix-nova's `h-8` in
  `input.tsx`, `select.tsx` (`data-[size=default]`) and `button.tsx` (`default` and `icon`).
  After `pnpm exec shadcn add <component> --overwrite` on one of those three, re-apply it.
- Check before adding: `pnpm dlx shadcn info`, `pnpm dlx shadcn docs <component>`.
- Add through the CLI (`pnpm exec shadcn add <component>`), never by pasting source.

## Composition

- Compose an existing primitive before hand-rolling one.
- Panels are `Drawer` from `components/ui/drawer.tsx` (vaul). Confirmations are drawers too, never
  `window.confirm`.
- Use the primitives' own variants and sizes. Don't override their height, padding, radius or font
  at the call site; `className` is for layout (width, flex, grid, spacing) and colour only.
- A status badge is `StatusDotBadge`, a stock `Badge` coloured from `STATUS_TONE_STYLE` in
  `src/lib/status-colors.ts`.
- Merge classes with `cn`, so consumer overrides win. Do not concatenate class strings.
- Forms use react-hook-form with Zod (`zodResolver`) and the shadcn `field` primitives
  (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`), with a `Controller` per field.

## Styling

- `[lint]` No hex colours in class strings. Use the semantic tokens (`bg-card`, `bg-sunken`,
  `text-foreground`, `text-text-2`, `border-line`, `bg-primary`, `text-warn`). If no token fits,
  add one to `src/index.css` for both themes.
- Tailwind utilities over inline `style`. Safe-area padding works as an arbitrary value:
  `pb-[max(1rem,env(safe-area-inset-bottom))]`.
- Hover styles stay behind `@media (hover: hover)`, which Tailwind 4's `hover:` already does.
- Icons come through `src/lib/icons.ts`. No emoji in the UI.
