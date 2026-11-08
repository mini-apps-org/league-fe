---
paths:
  - '**/*.test.{ts,tsx}'
  - 'src/test/**'
---

# Testing Rules

- Pure logic is tested beside its file: `src/lib/x.ts` → `src/lib/x.test.ts`.
- Components and pages are tested through what the user sees: Testing Library queries by role,
  label or text, in that order of preference. No `data-testid` unless nothing else identifies it.
- Interact with `userEvent`, never `fireEvent`.
- Render with `renderWithProviders` from `src/test/render.tsx`, so every test gets a fresh
  `QueryClient` and router.
- Mock the network with MSW. Defaults live in `src/test/handlers.ts`; override per test with
  `server.use(...)`. Never `vi.mock('@/api/...')`: the axios interceptors are part of what is tested.
- Unhandled requests fail the test (`onUnhandledFrame: 'error'`). Add a handler; do not loosen it.
- Assert on copy through `i18next.t(key)`, not on literal English strings.
