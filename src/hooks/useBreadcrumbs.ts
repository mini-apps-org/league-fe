import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router';

import { NAV_SECTIONS } from '@/utils';

import { usePageTitle } from './usePageTitle';

export interface Breadcrumb {
  label: string;
  // Set on every crumb but the current page.
  to?: string;
}

// "Admin console / Sessions" on a nav page; "Admin console / Sessions / Session" below one,
// where the middle crumb links back up.
export const useBreadcrumbs = (): Breadcrumb[] => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pageTitle = usePageTitle();

  const section = NAV_SECTIONS.find((candidate) => {
    return candidate.items.some((item) => matchPath({ path: item.to, end: false }, pathname));
  });
  const item = section?.items.find((candidate) => {
    return matchPath({ path: candidate.to, end: candidate.end ?? false }, pathname) !== null;
  });

  if (!section || !item) {
    return [{ label: pageTitle }];
  }

  const isNavPage = matchPath({ path: item.to, end: true }, pathname) !== null;
  const crumbs: Breadcrumb[] = [{ label: t(section.labelKey) }];

  if (!isNavPage) {
    crumbs.push({ label: t(item.labelKey), to: item.to });
  }
  crumbs.push({ label: pageTitle });

  return crumbs;
};
