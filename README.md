# Bida League (league-fe)

The installable web app (PWA) for running an 8-ball league night: put up players, enter results
and submit the night. It is a phone-first, static single-page app with English and Vietnamese
copy. All data and sign-in come from a separate backend, `league-be`.

> **Current state:** only the sign-in flow is live. The app has Google sign-in, the session gate,
> member linking and the public rules and privacy pages. The league screens (schedule, match,
> put-up, results, admin) are parked in [`_parked/`](_parked/RESTORE.md) until login is stable.
> `/onboarding` cannot complete yet, because its backend endpoints are parked too.

## Tech stack

| Area         | Tools                                                                |
| ------------ | -------------------------------------------------------------------- |
| App          | React 19, TypeScript 6 (strict), React Router 7                      |
| Build        | Vite 8                                                               |
| Styling      | Tailwind CSS 4, shadcn (radix-nova) on Radix UI, lucide-react, Inter |
| Server state | TanStack Query 5, axios                                              |
| Translations | i18next, react-i18next (`en`, `vi`)                                  |
| UI extras    | next-themes (light and dark), sonner (toasts), vaul (drawers)        |
| Tests        | Vitest, Testing Library, MSW, jsdom                                  |
| Code quality | ESLint, Prettier, husky, lint-staged, commitlint                     |
| Hosting      | Vercel (static build), deployed by GitHub Actions                    |

## Getting started

You need Node 24 (see `.nvmrc`), pnpm 10 (`corepack enable` picks up the pinned version) and a
running `league-be`. Without the backend, the app can't get past the login screen.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs at <http://localhost:5174>. The port is fixed, and `pnpm dev` fails rather than
choosing another one if 5174 is taken. `league-be` allows exactly one CORS origin, so its
`FRONTEND_URL` must be set to this address.

### Environment variables

| Variable       | Purpose                 | Default                                                       |
| -------------- | ----------------------- | ------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of `league-be` | `http://localhost:9200` in dev; required for production build |

### Commands

| Command                             | What it does                            |
| ----------------------------------- | --------------------------------------- |
| `pnpm dev`                          | Start the dev server on port 5174       |
| `pnpm build`                        | Type-check and build to `dist/`         |
| `pnpm preview`                      | Serve the production build locally      |
| `pnpm test` / `pnpm test:watch`     | Run the tests once / in watch mode      |
| `pnpm lint` / `pnpm lint:fix`       | Run ESLint (no warnings allowed) / fix  |
| `pnpm typecheck`                    | Type-check without emitting files       |
| `pnpm format` / `pnpm format:check` | Format with Prettier / check formatting |

## Folder structure

```text
league-fe/
├── .github/workflows/     CI (ci.yaml) and production deploy (cd.yaml)
├── .husky/                Git hooks
├── _parked/               League screens waiting to be restored; not compiled or linted
├── plans/                 Dated feature plans: YYYYMMDD-name/plan-N-*.md
├── public/                Manifest, icons and service worker, served as they are
├── src/
│   ├── api/               The only place that does HTTP: axios instance, BaseAPI, ENDPOINTS
│   ├── components/
│   │   ├── auth/          Sign-in and legal page components
│   │   ├── league/        League components used by the sign-in flow
│   │   └── ui/            Owned by the shadcn CLI; do not edit by hand
│   ├── hooks/             React hooks wrapping queries and mutations
│   ├── i18n/              en.json is the source of truth; vi.json must match its shape
│   ├── lib/               Pure helpers: errors, CSRF, navigation, icons
│   ├── pages/             Route screens
│   ├── queries/           TanStack Query queryOptions factories, one file per domain
│   ├── router/            Route table
│   ├── test/              Test setup, MSW handlers, render helpers
│   ├── types/             API contract types; errors.ts mirrors league-be's error codes
│   ├── index.css          Colour tokens (:root and .dark)
│   └── main.tsx           App entry point
├── vercel.json            Vercel build, SPA rewrite, security and cache headers
└── vite.config.ts         Vite config; rejects a production build without VITE_API_URL
```

Requests flow in one direction: page → hook → query → `src/api` → `league-be`.

## How it works

### Routes

| Path                 | Access    | Screen                   |
| -------------------- | --------- | ------------------------ |
| `/login`             | Public    | Google sign-in           |
| `/rules`, `/privacy` | Public    | Legal pages              |
| `/`                  | Signed in | Home                     |
| `/onboarding`        | Signed in | Link account to a member |

### Authentication

- The session is the HttpOnly `sid` cookie, so the app can't read it. To find out whether someone
  is signed in, it calls `GET /api/v1/me`.
- Mutating requests copy the `csrf` cookie (`__Host-csrf` in production) into the `X-CSRF-Token`
  header.
- There is no token refresh. Any 401 sends the user back to `/login`.
- Google sign-in is a full-page link to the backend, never an XHR request.

### Errors

Every failed request becomes an `ApiRequestError` (`src/lib/errors.ts`). Show it with
`messageFor(err)`, never `err.message`. A new `league-be` error code needs an `ERROR_CODE` entry
plus English and Vietnamese copy in the same change.

### PWA

The service worker is registered in production only. It caches only `/assets/*`, the icons and
the manifest. It never caches HTML or API responses, so a shared device can't show one user's
signed-in page to the next person. There is no offline mode.

## Contributing

Run `pnpm lint`, `pnpm typecheck` and `pnpm test` before opening a pull request. The git hooks
also check your work, and they should not be bypassed with `--no-verify`:

| Hook         | Runs                                                     |
| ------------ | -------------------------------------------------------- |
| `pre-commit` | lint-staged and the type-check                           |
| `commit-msg` | commitlint: Conventional Commits, `type(scope): subject` |
| `pre-push`   | The tests                                                |

Other conventions:

- Use only the colour tokens in `src/index.css`.
- Add every new string to both `en.json` and `vi.json`. A key missing from `vi.json` fails the
  type-check.
- Check UI changes in the browser at 360–430px, in both languages.

Pull requests into `dev` and `master` run the CI workflow: format check, lint, type-check, tests
and a production build.

## Deployment

Production runs on Vercel and deploys **only when a version tag is pushed**. Merging to `master`
does not deploy, and Vercel's own Git deployments are turned off in `vercel.json`.

### Releasing

Tag a commit that is already on `master`, using the existing `MAJOR.MINOR.PATCH` format:

```sh
git checkout master
git pull
git tag 0.1.2
git push origin 0.1.2
```

The push starts [`cd.yaml`](.github/workflows/cd.yaml), which:

1. Runs the full CI checks.
2. Fails if the tagged commit is not on `master`.
3. Pulls the production environment variables from Vercel and builds the app.
4. Fails if the bundle still contains `localhost:9200`, which means `VITE_API_URL` was not set.
5. Deploys to production and records the release and URL in the workflow summary.

The deploy job uses the GitHub `production` environment, so any approval rules set on that
environment apply before it runs.

### First-time setup

These steps are only needed for a new Vercel project or repository.

1. Create a Vercel project. Build settings come from `vercel.json`: `pnpm build`, output `dist`.
2. In the Vercel project's **Production** environment, set `VITE_API_URL` to the public
   `league-be` URL. The value is built into the bundle, so changing it requires a new release.
3. Add these GitHub Actions secrets:

   | Secret              | Value                                   |
   | ------------------- | --------------------------------------- |
   | `VERCEL_TOKEN`      | A Vercel access token                   |
   | `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

   Running `vercel link` locally creates `.vercel/project.json`.

4. Create a `production` environment in the GitHub repository settings.
5. Configure `league-be`:
   - Set `FRONTEND_URL` to the deployed frontend origin. If it doesn't match exactly, the deployed
     app fails with CORS errors that can look like frontend bugs.
   - Set `APP_ENV` to production, which adds the `__Host-` prefix and `Secure` to its cookies.

### Checking a release

After deploying, on the production URL:

1. Sign in with Google, and confirm the browser console shows no CORS errors.
2. Open a deep link such as `/rules` directly, and confirm it loads rather than returning a 404.
3. Sign out, and confirm the request succeeds and includes an `X-CSRF-Token` header. This proves
   the app can read the CSRF cookie on your production domains.

### Rolling back

Use Vercel to return to an earlier deployment, either from the project's **Deployments** page or
with the CLI:

```sh
vercel rollback
```

## Further reading

- [`_parked/RESTORE.md`](_parked/RESTORE.md): how to bring the league screens back
- [`plans/`](plans/): feature plans and the UI spec
- [`CHANGELOG.md`](CHANGELOG.md): notable changes by date
- [`CLAUDE.md`](CLAUDE.md) and [`.claude/rules/`](.claude/rules/): detailed project conventions
