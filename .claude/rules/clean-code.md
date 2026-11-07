---
paths:
  - '**/*.{ts,tsx}'
---

# Clean Code Rules

These override the shared rules in `~/.claude/rules` where they conflict.

`[lint]` is enforced by `pnpm lint`. Everything else is checked in review.

## Names

- Names reveal intent: `recentLocations`, not `data`.
- Functions are verb + noun, booleans read as questions (`isOpen`, `hasMore`).
- Module-level constants are `SCREAMING_SNAKE_CASE`.
- If a name needs a comment to explain it, rename it.

## Size

- `[lint]` A file over 300 lines must be split. `src/mocks/` and `src/components/ui/` are exempt.
  The files in the `max-lines` baseline in `eslint.config.mjs` are known debt: do not grow them,
  and remove the entry when one is split.
- Keep functions focused on one job, at one level of abstraction. Length is a prompt to look, not
  a hard limit: a long, flat component that only renders is fine.
- Nest at most two levels. Use guard clauses.

## Simplicity

- Do not build for a hypothetical: no abstraction with one caller, no option nobody passes.
- Reuse what exists before adding a helper. Check `src/lib/` and `src/hooks/` first.
- Duplication is cheaper than the wrong abstraction. Extract on the third use, or when two copies
  must stay in sync.

## Boundaries

- All requests go through `src/api/`. `[lint]` No `fetch` or direct `axios` elsewhere.
- Numbers and dates go through `lib/format.ts`, copy goes through i18n.
- Fixtures live in `src/mocks/`.

## Dead code

- Delete unused code rather than commenting it out. Git keeps it.
- `[lint]` No unused variables or imports.
