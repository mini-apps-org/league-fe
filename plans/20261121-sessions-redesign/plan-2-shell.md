# Phase 2 — App shell

**Status: done, 2026-11-21.** See the Outcome section for where the build differs from these tasks.

## Goal

The sidebar, the top bar and the content area match the design for super admins. The
non-admin shell keeps working.

## Tasks

- [ ] `src/components/AppSidebar.tsx`:
  - The brand row reads `app.name` ("Billiard League", updating the copy if it differs) over
    "Admin console", at a 64px height.
  - `HeaderMark` gains the design's highlight dot: `after:` utilities at the call site, with a
    `ring-sidebar` border.
  - Add a stock `SidebarFooter` with `UserAvatar`, the user's name, and a role label (new
    `shell.role.*` copy). It reads from `useMe` and `useRoles`.
- [ ] `src/components/AppNav.tsx`:
  - The active item gets the design's 3px left bar, through a `before:` utility on the
    `SidebarMenuButton` call. The colours come from the sidebar tokens.
  - The Sessions item shows a stock `SidebarMenuBadge` with the total from
    `useSessions(ALL_SESSIONS)`. It renders only when `useHasPermission('session.read')`.
    `NavItem` gains an optional `countQuery: 'sessions'`, so the badge is data-driven, not a
    special case.
  - Items use the stock `size="default"` (36px), as the design does.
- [ ] Breadcrumbs:
  - New hook `src/hooks/useBreadcrumbs.ts` returns `[{ label }]`. It looks up the current
    route's nav section label (from `NAV_SECTIONS`) and the page title from the route handle.
  - In `src/components/AppHeader.tsx`, show the breadcrumbs from `lg` up ("Admin console /
    **Sessions**"). Below `lg`, keep `NavDrawer` and the page title.
- [ ] `src/components/AppLayout.tsx`: `main` gets `max-w-280`, with `px-4 pt-5 pb-12` on mobile and
      `lg:px-6 lg:pt-8 lg:pb-16`.
- [ ] `src/components/PageTitle.tsx`:
  - Visible at every width, `text-2xl font-semibold tracking-tight`.
  - An optional `description` renders under it as `text-muted-foreground`.
  - Update the 20 callers only where they pass a description; the rest render as before.
- [ ] `src/components/RequireRole.tsx`: replace the bare `EmptyState` with the design's
      no-permission card. It has a lock icon, the title "You don't have access to this page",
      body copy, and a "Back to schedule" link button.
- [ ] i18n: add `shell.*` (role labels, breadcrumbs label) and the no-permission copy, in en and
      vi.
- [ ] Update `src/components/AppNav.test.tsx` if the active-item assertions change.

## Verify

- As a super admin at 1280px: the sidebar has the brand, both groups, a Sessions count that
  matches the list, an active bar and the user footer. The top bar shows breadcrumbs.
- At 375px: the hamburger opens `NavDrawer` with the same nav, and the title shows in the top bar.
- As a captain: there is no sidebar, and an admin URL shows the no-permission card.

## Outcome, 2026-11-21

- **Sidebar:**
  - `AppSidebar` has the brand row, nav and a `SidebarFooter` with the avatar, name and highest
    role. The role comes from `getHighestRole` in `src/lib/roles.ts`.
  - `HeaderMark` has the highlight dot.
  - `AppNav` items use the stock default size. The active item has a 3px bar (a sibling `span`,
    because `SidebarMenuButton` clips `before:` with `overflow-hidden`). Sessions has a count
    badge, rendered by `SessionCountBadge` behind `PermissionGate required="session.read"`.
    `NavItem` gained `countKey`.
- **Top bar:**
  - `AppHeader` shows breadcrumbs for super admins **at every width**. The design shows them on
    mobile too, so the page `h1` isn't duplicated in the bar.
  - Users without the sidebar see the mark and the app name.
  - The breadcrumbs use the stock shadcn `breadcrumb`, added through the CLI, with `/` as the
    separator. Under a nav page they gain a linked middle crumb, for example "Admin console /
    Sessions / Session".
  - The logic is in `src/hooks/useBreadcrumbs.ts`.
- **Layout:** `AppLayout` content is `max-w-280`, with the design's padding.
- **`PageTitle`:** always visible, at `text-2xl font-semibold`, with an optional `description`.
- **`RequireRole`:** shows the new shared `StateCard` (lock icon, title, body, "Back to
  schedule"). Phase 4 reuses `StateCard` for the list states.
- **Copy:** in en and vi, `auth.unauthorized` was reworded, and `auth.unauthorizedBody`,
  `auth.backToSchedule` and `shell.*` were added. The `Lock` and `LayoutDashboard` icons were
  added.
- **Checks:** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (104). The dev server compiles
  every changed module.
- **Not verified:** I didn't look at it in a browser.
- **Out of scope:** the avatar keeps its muted fallback rather than the design's yellow; the
  palette has no dark-safe text colour for yellow. `AccountMenu` still sets its own item sizes.
