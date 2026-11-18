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
  ADMIN_DIVISIONS: '/admin/divisions',
  ADMIN_FEES: '/admin/fees',
  ADMIN_AUDIT: '/admin/audit',
  DEV_COMPONENTS: '/dev/components',
} as const;
