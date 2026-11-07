export const BASE_ENDPOINT_PREFIX_V1 = '/api/v1';

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${BASE_ENDPOINT_PREFIX_V1}/auth/google/login`,
  AUTH_LOGOUT: `${BASE_ENDPOINT_PREFIX_V1}/auth/logout`,
  ME: `${BASE_ENDPOINT_PREFIX_V1}/me`,

  SEASONS: `${BASE_ENDPOINT_PREFIX_V1}/seasons`,
  DIVISIONS: `${BASE_ENDPOINT_PREFIX_V1}/divisions`,
  TEAM_MATCHES: `${BASE_ENDPOINT_PREFIX_V1}/team-matches`,
  INDIVIDUAL_MATCHES: `${BASE_ENDPOINT_PREFIX_V1}/individual-matches`,
  PLAYERS: `${BASE_ENDPOINT_PREFIX_V1}/players`,
  TEAMS: `${BASE_ENDPOINT_PREFIX_V1}/teams`,
  MEMBERS_PREVIEW: `${BASE_ENDPOINT_PREFIX_V1}/members/preview`,
  ME_LINK: `${BASE_ENDPOINT_PREFIX_V1}/me/link`,
} as const;

export const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:9200';
