import {
  CalendarDays,
  CalendarRange,
  Layers,
  LayoutDashboard,
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
  DASHBOARD: '/dashboard',
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
  ADMIN_SESSIONS: '/admin/sessions',
  ADMIN_SESSION: '/admin/sessions/:sessionId',
  ADMIN_SESSION_MATCH: '/admin/sessions/:sessionId/matches/:matchId',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_DIVISIONS: '/admin/divisions',
  ADMIN_FEES: '/admin/fees',
  ADMIN_AUDIT: '/admin/audit',
  DEV_COMPONENTS: '/dev/components',
} as const;

export interface NavItem {
  to: string;
  labelKey:
    | 'nav.dashboard'
    | 'nav.schedule'
    | 'nav.standings'
    | 'nav.players'
    | 'nav.sessions'
    | 'nav.teams'
    | 'nav.divisions'
    | 'nav.fees'
    | 'nav.audit';
  icon: LucideIcon;
  end?: boolean;
  // Shows a count badge beside the item, read from the matching list query.
  countKey?: 'sessions';
}

export interface NavSection {
  labelKey: 'nav.league' | 'nav.adminConsole';
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    labelKey: 'nav.league',
    items: [
      { to: ROUTES.DASHBOARD, labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: ROUTES.HOME, labelKey: 'nav.schedule', icon: CalendarDays, end: true },
      { to: ROUTES.STANDINGS, labelKey: 'nav.standings', icon: Trophy },
    ],
  },
  {
    labelKey: 'nav.adminConsole',
    items: [
      { to: ROUTES.ADMIN_PLAYERS, labelKey: 'nav.players', icon: Users },
      {
        to: ROUTES.ADMIN_SESSIONS,
        labelKey: 'nav.sessions',
        icon: CalendarRange,
        countKey: 'sessions',
      },
      { to: ROUTES.ADMIN_TEAMS, labelKey: 'nav.teams', icon: Shield },
      { to: ROUTES.ADMIN_DIVISIONS, labelKey: 'nav.divisions', icon: Layers },
      { to: ROUTES.ADMIN_FEES, labelKey: 'nav.fees', icon: Wallet },
      { to: ROUTES.ADMIN_AUDIT, labelKey: 'nav.audit', icon: ScrollText },
    ],
  },
];
