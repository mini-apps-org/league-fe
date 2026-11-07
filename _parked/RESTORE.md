# Parked: everything that is not sign-in

Parked on 2026-11-07, to be restored once the login flow is complete and running stably.

`league-fe` has **no commits**, so `git stash` is unavailable here — stashing requires a HEAD.
These files were moved rather than stashed. Nothing was deleted.

They sit outside `src/`, which is why the app still builds: `tsconfig.json` compiles only
`src`, and `eslint.config.mjs` scopes its rules to `src/**/*.{ts,tsx}`. So the parked code is
neither type-checked nor linted while it waits here.

## Restore

```sh
cd league-fe
cp -R _parked/src/. src/
rm -rf _parked
```

Then put the routes back in `src/router/index.tsx`: `/` → `SchedulePage`, `/matches/:id` →
`MatchPage`, `/matches/:id/put-up` → `PutUpPage`, `/matches/:id/result/:order` →
`ResultPage`, and `/admin/players` → `PlayersPage` behind `RequireAdmin`. `HomePage` goes back
to being unused at that point.

The backend half is in `league-be`'s `stash@{0}` ("stash importatn"): `internal/league/`,
migrations `00002_business_rules.sql` and `00003_member_link.sql`, the league routes, and the
`role` + `playerId` additions to `/api/v1/me`.

## What was parked

| Path | Why |
|---|---|
| `src/pages/SchedulePage.tsx` | league screen |
| `src/pages/MatchPage.tsx` | league screen |
| `src/pages/PutUpPage.tsx` | league screen |
| `src/pages/ResultPage.tsx` | league screen |
| `src/pages/admin/PlayersPage.tsx` | league screen |
| `src/components/league/*` (17 files) | league UI — **except `SkillLevelSquare.tsx`** |
| `src/components/RequireAdmin.tsx` | admin route gate |
| `src/hooks/useLeague.ts`, `useLeagueMutations.ts` | league data access |
| `src/lib/rules.ts` + test | race chart and points mirror (26 tests) |
| `src/lib/night.ts` + test | night state machine (7 tests) |
| `src/lib/schemas.ts` | Zod for result entry and skill-level change |
| `src/lib/format.ts` | only league screens used it |

## What stayed, and why

- `src/components/league/SkillLevelSquare.tsx` — `MemberPreviewCard` renders it, so it is
  part of the login flow now.
- `src/api/leagueAPI.ts` — holds `fetchMemberPreview` and `linkMember`, which the member-link
  step needs. Its other methods are inert until the screens return. It imports only types, so
  it costs nothing to keep.
- `src/types/league.ts` — types only, no runtime, and `MemberPreview` lives here.
- The league i18n keys in `en.json` / `vi.json` — unused for now, and deleting them would
  only have to be undone on restore.

## Known gap while parked

`/onboarding` cannot complete: `GET /api/v1/members/preview` and `POST /api/v1/me/link` are in
the backend stash, and `/api/v1/me` no longer returns `playerId`. The gate is written to stay
**inert** when `playerId` is absent, so the rest of the flow still works — a signed-in user
lands on `/` rather than being trapped on a linking screen that cannot finish.
