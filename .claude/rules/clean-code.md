---
paths:
  - '**/*.{ts,tsx}'
  - 'src/i18n/**'
---

# Clean Code Rules

These override the shared rules in `~/.claude/rules` where they conflict.

`[lint]` is enforced by `pnpm lint`; `[type]` by `pnpm typecheck`. Everything else is checked in
review.

## Names

- Names reveal intent: `recentLocations`, not `data`.
- Functions are verb + noun, booleans read as questions (`isOpen`, `hasMore`).
- Module-level constants are `SCREAMING_SNAKE_CASE`.
- If a name needs a comment to explain it, rename it.
- One verb per concept: `fetch*` is an HTTP call in `src/api/`, `get*` is a synchronous read or
  derivation, `use*` is a hook, `handle*` is an event handler inside a component, `on*` is a
  handler prop. Do not mix `load`/`retrieve`/`fetch` for the same thing.
- Use the league's domain words (put-up, night, race, skill level) as `src/types/league.ts` and
  the i18n keys do, not generic ones (`item`, `entry`, `record`).

## Size

- `[lint]` A file over 300 lines must be split. `src/components/ui/` is exempt.
- Keep functions focused on one job, at one level of abstraction. Length is a prompt to look, not
  a hard limit: a long, flat component that only renders is fine.
- Nest at most two levels. Use guard clauses.

## Functions

- `[lint]` At most three parameters (`max-params`). Group related values into an object typed
  with an interface: `registerPlayer(player: NewPlayer, team: TeamRef)`.
- No boolean flag parameters: `submitNight(id, true)` says nothing at the call site. Use a
  string-literal union (`'draft' | 'final'`) or a named field in an options object. Use `as const`
  objects or unions, not TS `enum`.
- Business logic lives in pure functions in `src/lib/`: same input, same output, no I/O, no
  mutation, no reading globals. Each gets a unit test beside it. Side effects stay at the edges:
  `src/api/`, hooks and event handlers.

## Simplicity

- Do not build for a hypothetical: no abstraction with one caller, no option nobody passes.
- Reuse what exists before adding a helper. Check `src/lib/` and `src/hooks/` first.
- Duplication is cheaper than the wrong abstraction. Extract on the third use, or when two copies
  must stay in sync.

## Imports and exports

- `[lint]` Named exports only. No `export default` in `src/`.
- `[lint]` Import order is sorted by `simple-import-sort`: packages first, then `@/…`, then
  relative paths, each group separated by a blank line. Run `pnpm lint:fix` rather than ordering
  by hand.
- `[lint]` Type-only imports use `import type`.
- Routing imports come from `react-router`, never `react-router-dom`.
- Import through the `@/` alias across folders. A relative path is for a sibling in the same folder.

## Boundaries

- All requests go through `src/api/`. `[lint]` No `fetch` or direct `axios` elsewhere.
- Format numbers and dates with `Intl`, in one shared helper once a second screen needs the same
  format.
- Test fixtures and MSW handlers live in `src/test/`.

## i18n

- `[lint]` No hard-coded copy, in JSX text or in `aria-label`, `placeholder`, `title` and `alt`.
- `[type]` Every key goes in both `en.json` and `vi.json`. A key missing from vi fails typecheck.
- `[type]` Keys passed to `t()` are checked against `en.json` through `src/i18n/i18next.d.ts`.
  A dynamic key must be built from a literal union (`` `common.theme.${choice}` ``), never cast.
- Group keys by screen or domain (`auth.*`, `link.*`), not by component.
- An extra key in vi is not caught by typecheck. Delete keys from both files together.

## Comments

The shared `~/.claude/rules/code-comments.md` applies. In this project additionally:

- Copied or adapted code links its source (Stack Overflow answer, docs page, issue).
- A workaround for a bug in a library or browser says what breaks and links the issue. That is
  the only bug-fix comment allowed; never write history (`// fixed X`, `// was Y`).
- A `TODO` must carry its ticket: `// TODO(<Notion ticket URL>): what is missing and why`.
- A magic number becomes a named constant, not a comment.

## Dead code

- Delete unused code rather than commenting it out. Git keeps it.
- `[lint]` No unused variables or imports.
