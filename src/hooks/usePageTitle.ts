import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router';

export interface RouteHandle {
  titleKey: ParseKeys;
}

const isRouteHandle = (handle: unknown): handle is RouteHandle => {
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
