import { useTranslation } from 'react-i18next';
import { NavLink, useMatch } from 'react-router';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NAV_SECTIONS, type NavItem } from '@/utils';

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
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink to={item.to} end={item.end} onClick={onNavigate}>
          <Icon aria-hidden />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      </SidebarMenuButton>
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
