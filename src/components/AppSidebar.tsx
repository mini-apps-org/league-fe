import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AppNav } from '@/components/AppNav';
import { HeaderMark } from '@/components/HeaderMark';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { UserAvatar } from '@/components/UserAvatar';
import { useMe } from '@/hooks/useMe';
import { useRoles } from '@/hooks/useRole';
import { getHighestRole } from '@/lib/roles';
import { ROUTES } from '@/utils';

const SidebarAccount = () => {
  const { t } = useTranslation();
  const { data } = useMe();
  const role = getHighestRole(useRoles());

  return (
    <SidebarFooter className="flex-row items-center gap-2.5 border-t border-sidebar-border p-3">
      <UserAvatar user={data?.user} className="size-8" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{data?.user.name}</span>
        {role !== undefined && (
          <span className="truncate text-xs text-muted-foreground">{t(`shell.role.${role}`)}</span>
        )}
      </div>
    </SidebarFooter>
  );
};

// Desktop only. Below lg the same AppNav opens from NavDrawer, so the sidebar never collapses
// into shadcn's mobile Sheet: panels in this app are vaul drawers.
export const AppSidebar = () => {
  const { t } = useTranslation();

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border lg:flex"
    >
      <SidebarHeader className="h-16 flex-row items-center gap-2.5 border-b border-sidebar-border px-4 py-0">
        <Link to={ROUTES.HOME} aria-label={t('app.name')} className="shrink-0 rounded-lg">
          <HeaderMark />
        </Link>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{t('app.name')}</span>
          <span className="truncate text-xs text-muted-foreground">{t('nav.adminConsole')}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1.5 py-1">
        <AppNav />
      </SidebarContent>
      <SidebarAccount />
    </Sidebar>
  );
};
