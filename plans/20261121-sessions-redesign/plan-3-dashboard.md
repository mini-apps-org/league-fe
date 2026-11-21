# Phase 3 — Dashboard placeholder

**Status: done, 2026-11-21.** See the Outcome section for where the build differs from these tasks.

## Goal

The design's "Dashboard" link works and lands on a placeholder until the dashboard is designed.

## Tasks

- [ ] `src/utils/constants.ts`:
  - Add `ROUTES.DASHBOARD = '/dashboard'`.
  - Add `'nav.dashboard'` to the `NavItem['labelKey']` union.
  - Make Dashboard the first item of the `nav.league` section, with the `LayoutDashboard` icon.
- [ ] `src/lib/icons.ts`: export `LayoutDashboard`.
- [ ] Add `src/pages/dashboard/DashboardPage.tsx`, rendering `PageTitle` and `common.comingSoon`,
      like the other placeholders.
- [ ] `src/router/index.tsx`: register the route next to Standings, open to every signed-in user,
      with `handle: titled('dashboard.title')`.
- [ ] i18n: `nav.dashboard` and `dashboard.title` in en ("Dashboard") and vi ("Tổng quan").

## Verify

- The Dashboard link is first under League, shows as active on `/dashboard`, and renders the
  placeholder.

## Outcome, 2026-11-21

- `ROUTES.DASHBOARD` is `/dashboard`. It is the first League nav item, with the `LayoutDashboard`
  icon.
- `src/pages/dashboard/DashboardPage.tsx` is a placeholder. The route sits next to Standings.
- `nav.dashboard` and `dashboard.title` are in en and vi.
- **Not verified:** I didn't check it in a browser.
