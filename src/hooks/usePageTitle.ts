import type { ParseKeys } from 'i18next';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { Params } from 'react-router';
import { useMatches } from 'react-router';

export interface PageNameProps {
  params: Params;
  // The route's titleKey, translated: shown until the name loads, or if it never does.
  fallback: string;
}

export interface RouteHandle {
  titleKey: ParseKeys;
  // Names the page in the last breadcrumb, such as a team's name. It is a component, not a
  // hook, because the header stays mounted while the routes, and so their hooks, change.
  PageName?: ComponentType<PageNameProps>;
}

export const isRouteHandle = (handle: unknown): handle is RouteHandle => {
  return typeof handle === 'object' && handle !== null && 'titleKey' in handle;
};

export const usePageTitle = (): string => {
  const { t } = useTranslation();
  const matches = useMatches();

  const handle = matches
    .map((match) => match.handle)
    .filter(isRouteHandle)
    .at(-1);

  return handle === undefined ? t('app.name') : t(handle.titleKey);
};
