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
