# 2026-11-24

- feat(sessions): add `/admin/sessions` for super admins: list sessions with stats, search, type/year/status filters, filter chips and sortable columns, all kept in the URL
- feat(sessions): create, edit and delete sessions in a side sheet (bottom sheet on mobile), with react-hook-form and Zod validation, duplicate-name checks and type-the-name delete confirmation
- feat(sessions): add the session admin API client, query factories and mutation hooks for sessions, weeks, team matches and individual matches
- feat(nav): add breadcrumbs, a session count and a user footer to the admin shell, a no-access card, and a `/dashboard` placeholder
- feat(ui): adopt the Sessions Redesign theme (teal and yellow palette, Be Vietnam Pro, 8px radius) on stock shadcn primitives with 36px controls
- chore(dev): serve the session routes from an MSW mock in `pnpm dev` (`src/test/mocks/data/sessions.json`) until league-be ships them; sign-in and `/me` stay real. `VITE_API_MOCKS=false` turns it off
- chore(dev): remove the component gallery page and its route
- refactor: move the race chart and points rules from `_parked/` to `src/lib/rules.ts`
- docs: add the session CRUD plan with the proposed API contract, and the Sessions Redesign plan

# 2026-11-17
- feat(ui): implement the clean blue theme and component variants

# 2026-11-08

- feat(auth): read the CSRF token from `__Secure-csrf` instead of `__Host-csrf`
- feat(ui): rename the app to "Billiard League" in the title, manifest and copy
- feat(ui): catch render and route failures with an error page that offers a reload
- build: require `VITE_API_URL` for a production build instead of silently falling back to localhost
- build: pin Node 24 via `.nvmrc` and `engines`, and add security and cache headers on Vercel
- chore: add husky hooks — lint-staged and typecheck on commit, commitlint on the message, tests on push
- test: cover the auth gate and onboarding with MSW and Testing Library
- docs: add a README with setup, environment and deployment steps
- refactor: move to the `react-router` package, named page exports and `queryOptions` factories in `src/queries`

# 2026-11-07

- chore: GitHub Actions CI and a tag-triggered Vercel production deploy
- docs: MVP and login plans, UI spec and project code-style rules
- feat(auth): Google sign-in, session gate and member-id linking
- feat(ui): shadcn component primitives and a shared icon barrel
- chore: scaffold Vite + React 19 + TypeScript with Tailwind, ESLint and Vitest
