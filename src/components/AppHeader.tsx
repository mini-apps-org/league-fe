import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AccountMenu } from '@/components/AccountMenu';
import { HeaderMark } from '@/components/HeaderMark';
import { NavDrawer } from '@/components/NavDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useHasRole } from '@/hooks/useHasRole';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ROLE, ROUTES } from '@/utils';

export const AppHeader = () => {
  const { t } = useTranslation();
  const pageTitle = usePageTitle();
  const hasSidebar = useHasRole([ROLE.SUPER_ADMIN]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-2.5 pr-1.5 pl-4 lg:h-16 lg:gap-3 lg:px-6">
        {hasSidebar ? (
          <NavDrawer />
        ) : (
          <Link to={ROUTES.HOME} aria-label={t('app.name')} className="shrink-0 rounded-[10px]">
            <HeaderMark />
          </Link>
        )}

        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">
          {hasSidebar ? (
            pageTitle
          ) : (
            <>
              <span className="lg:hidden">{pageTitle}</span>
              <span className="hidden lg:inline">{t('app.name')}</span>
            </>
          )}
        </span>

        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
};
