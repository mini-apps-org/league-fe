import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { Params } from 'react-router';
import { matchPath, useLocation, useMatches } from 'react-router';

import { NAV_SECTIONS, type NavItem } from '@/utils';

import { isRouteHandle, type PageNameProps, usePageTitle } from './usePageTitle';

export interface Breadcrumb {
  label: string;
  // Set on every crumb but the current page.
  to?: string;
  // Set on the current page when its route names it, as the team detail page does.
  pageName?: { PageName: ComponentType<PageNameProps>; params: Params };
}

// "Admin console / Sessions" on a nav page; "Admin console / Sessions / Session" below one,
// where the middle crumb links back up.
export const useBreadcrumbs = (): Breadcrumb[] => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pageTitle = usePageTitle();
  const pageMatch = useMatches()
    .filter((match) => isRouteHandle(match.handle))
    .at(-1);
  const pageCrumb: Breadcrumb = { label: pageTitle };

  if (pageMatch !== undefined && isRouteHandle(pageMatch.handle) && pageMatch.handle.PageName) {
    pageCrumb.pageName = { PageName: pageMatch.handle.PageName, params: pageMatch.params };
  }

  // Both lookups honour `end`: the Schedule item is '/', which would otherwise match every path
  // and claim the League section for admin pages.
  const isActiveItem = (candidate: NavItem): boolean => {
    return matchPath({ path: candidate.to, end: candidate.end ?? false }, pathname) !== null;
  };
  const section = NAV_SECTIONS.find((candidate) => candidate.items.some(isActiveItem));
  const item = section?.items.find(isActiveItem);

  if (!section || !item) {
    return [pageCrumb];
  }

  const isNavPage = matchPath({ path: item.to, end: true }, pathname) !== null;
  const crumbs: Breadcrumb[] = [{ label: t(section.labelKey) }];

  if (!isNavPage) {
    crumbs.push({ label: t(item.labelKey), to: item.to });
  }
  crumbs.push(pageCrumb);

  return crumbs;
};
