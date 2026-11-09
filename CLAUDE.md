# league-fe

Bida League PWA. Vite + React 19 + TypeScript (strict) + Tailwind 4 + shadcn (radix-nova) +
TanStack Query + i18next (en, vi). Backend: league-be on http://localhost:9200 (`VITE_API_URL`).

## Commands

`pnpm dev` (port 5174) · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm format` · `pnpm build`

Run lint, typecheck and test before calling work done. `pnpm build` needs `VITE_API_URL` set
(see `.env.example`).

Git hooks (husky): pre-commit runs lint-staged + typecheck, commit-msg runs commitlint
(Conventional Commits: `type(scope): lowercase subject`), pre-push runs the tests. Never bypass
them with `--no-verify`.

## Layout

| Path                 | Holds                                                                               |
| -------------------- | ----------------------------------------------------------------------------------- |
| `src/api/`           | The only place that does HTTP: axios instance, `BaseAPI`, `ENDPOINTS`               |
| `src/queries/`       | `queryOptions` factories, one file per domain                                       |
| `src/hooks/`         | React hooks wrapping queries and mutations                                          |
| `src/lib/`           | Pure helpers: errors, csrf, navigate, icons                                         |
| `src/types/`         | API contract types; `errors.ts` mirrors league-be's error-code registry             |
| `src/i18n/`          | `en.json` is the source of truth; `vi.json` must match its shape                    |
| `src/components/ui/` | Owned by the shadcn CLI. Do not hand-edit                                           |
| `src/test/`          | Test setup, MSW handlers, render helpers                                            |
| `_parked/`           | League screens parked until login is stable. Not compiled. See `_parked/RESTORE.md` |
| `plans/`             | Dated feature plans: `YYYYMMDD-name/plan-N-*.md`                                    |

## Auth model

- The session is the HttpOnly `sid` cookie. Never infer auth from `document.cookie`; ask
  `GET /api/v1/me`.
- Mutating requests echo the `csrf` / `__Host-csrf` cookie into `X-CSRF-Token` (`src/lib/csrf.ts`).
- Any 401 is terminal (there is no refresh): the axios interceptor hard-redirects to `/login`,
  except for `/me`, where `RequireAuth` renders `<Navigate>` instead.
- Google sign-in is a full-page navigation (`<a href>`), never XHR.

## Errors

Every failure becomes an `ApiRequestError` (`src/lib/errors.ts`). Show it with `messageFor(err)`,
never `err.message`. A new league-be error code needs `ERROR_CODE` plus en and vi copy in the
same change.

## Palette

Tokens live in `src/index.css` (`:root` and `.dark`). No colours outside that list.
