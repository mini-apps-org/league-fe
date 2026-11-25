import { useTranslation } from 'react-i18next';
import { NavLink, useMatch } from 'react-router';

import { PermissionGate } from '@/components/PermissionGate';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSessions } from '@/hooks/useLeagueQueries';
import { ALL_SESSIONS } from '@/lib/session-filters';
import { NAV_SECTIONS, type NavItem } from '@/utils';

// Its own component, so the sessions query only runs for users the gate lets through.
const SessionCountBadge = () => {
  const { data } = useSessions(ALL_SESSIONS);

  if (data === undefined) {
    return null;
  }

  return (
    <SidebarMenuBadge className="bg-highlight-soft text-highlight-foreground">
      {data.length}
    </SidebarMenuBadge>
  );
};

interface AppNavProps {
  onNavigate?: () => void;
}

interface AppNavLinkProps extends AppNavProps {
  item: NavItem;
}

const AppNavLink = ({ item, onNavigate }: AppNavLinkProps) => {
  const { t } = useTranslation();
  const isActive = useMatch({ path: item.to, end: item.end ?? false }) !== null;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-y-2 -left-2 w-0.75 rounded-r-sm bg-sidebar-primary"
        />
      )}
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink to={item.to} end={item.end} onClick={onNavigate}>
          <Icon aria-hidden />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      </SidebarMenuButton>
      {item.countKey === 'sessions' && (
        <PermissionGate required="session.read">
          <SessionCountBadge />
        </PermissionGate>
      )}
    </SidebarMenuItem>
  );
};

export const AppNav = ({ onNavigate }: AppNavProps) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('nav.label')} className="flex flex-col">
      {NAV_SECTIONS.map((section) => (
        <SidebarGroup key={section.labelKey}>
          <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <AppNavLink key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
};
