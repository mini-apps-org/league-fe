import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, envelope } from '@/test/handlers';
import { getLeagueStore } from '@/test/mocks/league-store';
import { server } from '@/test/server';

import { ENDPOINTS } from './endpoints';
import { LeagueAdminAPI } from './leagueAdminAPI';

const SESSION_WIRE = {
  id: 'session-new',
  league_id: 'league-1',
  name: 'Spring 2027',
  session_type: 'SPRING',
  season_year: 2027,
  starts_on: '2027-01-10',
  ends_on: '2027-04-30',
  status: 'DRAFT',
  is_active: false,
  week_count: 0,
  has_submitted_results: false,
  created_at: '2026-11-25T00:00:00Z',
  updated_at: '2026-11-25T00:00:00Z',
};

interface CapturedWrite {
  method: 'post' | 'patch';
  path: string;
  response: Record<string, unknown>;
}

const captureRequestBody = ({ method, path, response }: CapturedWrite): (() => unknown) => {
  let captured: unknown;

  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      captured = await request.json();

      return envelope(response);
    }),
  );

  return () => {
    return captured;
  };
};

describe('LeagueAdminAPI sessions', () => {
  it('sends list filters as league-be query params and returns camelCase sessions', async () => {
    let search = '';
    server.use(
      http.get(apiUrl(ENDPOINTS.SESSIONS), ({ request }) => {
        search = new URL(request.url).search;

        return envelope([SESSION_WIRE]);
      }),
    );

    const sessions = await LeagueAdminAPI.fetchSessions({
      sessionType: 'SPRING',
      seasonYear: 2027,
      sort: '-starts_on',
    });

    expect(search).toBe('?session_type=SPRING&season_year=2027&sort=-starts_on');
    expect(sessions[0]).toMatchObject({ sessionType: 'SPRING', seasonYear: 2027, weekCount: 0 });
  });

  it('creates a session with a snake_case body', async () => {
    const getBody = captureRequestBody({
      method: 'post',
      path: ENDPOINTS.SESSIONS,
      response: SESSION_WIRE,
    });

    const created = await LeagueAdminAPI.createSession({
      name: 'Spring 2027',
      sessionType: 'SPRING',
      seasonYear: 2027,
      startsOn: '2027-01-10',
      endsOn: '2027-04-30',
    });

    expect(getBody()).toStrictEqual({
      name: 'Spring 2027',
      session_type: 'SPRING',
      season_year: 2027,
      starts_on: '2027-01-10',
      ends_on: '2027-04-30',
    });
    expect(created).toMatchObject({ id: 'session-new', startsOn: '2027-01-10', isActive: false });
  });

  it('patches only the changed fields', async () => {
    const getBody = captureRequestBody({
      method: 'patch',
      path: `${ENDPOINTS.SESSIONS}/session-new`,
      response: { ...SESSION_WIRE, is_active: true },
    });

    const updated = await LeagueAdminAPI.updateSession('session-new', { isActive: true });

    expect(getBody()).toStrictEqual({ is_active: true });
    expect(updated.isActive).toBe(true);
  });

  it('reads the default mock, which answers in league-be’s shape', async () => {
    const seeded = getLeagueStore().sessions[0];
    if (!seeded) {
      throw new Error('the league seed has no sessions');
    }

    const session = await LeagueAdminAPI.fetchSession(seeded.id);

    expect(session).toMatchObject({ id: seeded.id, name: seeded.name, leagueId: seeded.leagueId });
  });
});
