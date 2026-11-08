---
paths:
  - '**/*.tsx'
  - 'src/hooks/**'
  - 'src/queries/**'
---

# React 19 Rules

These override the shared rules in `~/.claude/rules` where they conflict.

`[lint]` is enforced by `pnpm lint` through `eslint-plugin-react-hooks` and `jsx-a11y`. Everything
else is checked in review.

## React 19 APIs

- `ref` is a normal prop. Do not use `forwardRef` in new components.
- Render `<ThemeContext value={theme}>`, not `<ThemeContext.Provider>`.
- Ref callbacks use a block body. A returned function is treated as the ref's cleanup.
- When a mutation or form arrives, reach for `useOptimistic`, `useActionState` and `useFormStatus`
  before hand-rolling pending and rollback state.
- `use` needs a promise from a Suspense-compatible source. Never create the promise in render.
  Data fetching stays in TanStack Query.

## Effects

Effects only synchronise with something outside React: listeners, timers, the DOM, browser APIs.

- `[lint]` Do not call `setState` synchronously in an effect.
- Derive values during render instead of syncing them into state.
- Reset state in the event handler that causes the change, or remount with `key`.
- Do not run business logic in an effect because a value changed. Run it in the event that
  changed the value.

## State

- Server state stays in TanStack Query. Do not copy query data into `useState`.
- Local UI edits on top of server data are an override: `override ?? data.someField`.
- Query keys and fetchers live in `src/queries/*` as `queryOptions` factories. Hooks and
  `invalidateQueries` reuse the factory's `queryKey`; never retype a key array.

## Memoisation

The React Compiler is not enabled, but do not memoise by default. Use `useMemo` or `useCallback`
only for a measured cost, or when something depends on a stable identity such as an effect
dependency or a callback ref.

## Components and hooks

- `[lint]` Only hooks are named `use*`. A plain function named `useX` trips the rules of hooks.
- `[lint]` Never define a component inside a component: it remounts on every render.
- Hooks hold logic, components render, pure helpers live outside React. Hooks never return JSX.
- One exported component per file, except small private helpers.
- `[lint]` Named exports only. No `export default` in `src/`.
- Use real `<button>`, `<a>`, `<input>` and `<label>`. Icon-only buttons need `aria-label`.
- `[lint]` No `dangerouslySetInnerHTML`.
- `[lint]` No hard-coded JSX text: every string goes through i18n.
