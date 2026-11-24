import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AccountMenu } from '@/components/AccountMenu';
import { HeaderMark } from '@/components/HeaderMark';
import { NavDrawer } from '@/components/NavDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { useHasRole } from '@/hooks/useHasRole';
import { ROLE, ROUTES } from '@/utils';

const HeaderBreadcrumbs = () => {
  const { t } = useTranslation();
  const crumbs = useBreadcrumbs();

  return (
    <Breadcrumb aria-label={t('shell.breadcrumbs')} className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.label}>
            {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            <BreadcrumbItem className="min-w-0">
              {index === crumbs.length - 1 && (
                <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
              )}
              {index < crumbs.length - 1 && crumb.to !== undefined && (
                <BreadcrumbLink asChild>
                  <Link to={crumb.to}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
              {index < crumbs.length - 1 && crumb.to === undefined && (
                <span className="truncate">{crumb.label}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const AppHeader = () => {
  const { t } = useTranslation();
  const hasSidebar = useHasRole([ROLE.SUPER_ADMIN]);

  return (
    <header className="sticky top-0 z-30 border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {hasSidebar ? (
          <>
            <NavDrawer />
            <HeaderBreadcrumbs />
          </>
        ) : (
          <>
            <Link to={ROUTES.HOME} aria-label={t('app.name')} className="shrink-0 rounded-lg">
              <HeaderMark />
            </Link>
            <span className="min-w-0 flex-1 truncate font-semibold">{t('app.name')}</span>
          </>
        )}

        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
};
