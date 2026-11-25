import {
  CalendarDays,
  CalendarRange,
  Layers,
  type LucideIcon,
  ScrollText,
  Shield,
  Trophy,
  Users,
  Wallet,
} from '@/lib/icons';
import type { Role } from '@/types/league';

export const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
} as const satisfies Record<Role, Role>;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  RULES: '/rules',
  PRIVACY: '/privacy',
  STANDINGS: '/standings',
  PROFILE: '/profile',
  MATCH: '/matches/:id',
  MATCH_PUT_UP: '/matches/:id/put-up',
  MATCH_RESULT: '/matches/:id/result/:order',
  MATCH_LIVE: '/matches/:id/live',
  MATCH_VERIFY: '/matches/:id/verify',
  TEAM_ROSTER: '/teams/:id/roster',
  TEAM_SETTINGS: '/teams/:id/settings',
  TEAM_MEMBER_SESSION: '/teams/:id/members/:memberId/session',
  ADMIN_PLAYERS: '/admin/players',
  ADMIN_SEASONS: '/admin/seasons',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_TEAM: '/admin/teams/:id',
  ADMIN_DIVISIONS: '/admin/divisions',
  ADMIN_FEES: '/admin/fees',
  ADMIN_AUDIT: '/admin/audit',
} as const;

export interface NavItem {
  to: string;
  labelKey:
    | 'nav.schedule'
    | 'nav.standings'
    | 'nav.players'
    | 'nav.seasons'
    | 'nav.teams'
    | 'nav.divisions'
    | 'nav.fees'
    | 'nav.audit';
  icon: LucideIcon;
  end?: boolean;
}

export interface NavSection {
  labelKey: 'nav.league' | 'nav.adminConsole';
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    labelKey: 'nav.league',
    items: [
      { to: ROUTES.HOME, labelKey: 'nav.schedule', icon: CalendarDays, end: true },
      { to: ROUTES.STANDINGS, labelKey: 'nav.standings', icon: Trophy },
    ],
  },
  {
    labelKey: 'nav.adminConsole',
    items: [
      { to: ROUTES.ADMIN_PLAYERS, labelKey: 'nav.players', icon: Users },
      { to: ROUTES.ADMIN_SEASONS, labelKey: 'nav.seasons', icon: CalendarRange },
      { to: ROUTES.ADMIN_TEAMS, labelKey: 'nav.teams', icon: Shield },
      { to: ROUTES.ADMIN_DIVISIONS, labelKey: 'nav.divisions', icon: Layers },
      { to: ROUTES.ADMIN_FEES, labelKey: 'nav.fees', icon: Wallet },
      { to: ROUTES.ADMIN_AUDIT, labelKey: 'nav.audit', icon: ScrollText },
    ],
  },
];
