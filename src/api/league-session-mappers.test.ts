import { describe, expect, it } from 'vitest';

import type { LeagueSession } from '@/types/league';
import type { LeagueSessionWire } from '@/types/league-wire';

import { toLeagueSession, toLeagueSessionBody, toSessionWeek } from './league-session-mappers';

const SESSION_WIRE: LeagueSessionWire = {
  id: 'session-1',
  league_id: 'league-1',
  name: 'Fall 2026',
  session_type: 'FALL',
  season_year: 2026,
  starts_on: '2026-09-01',
  ends_on: '2026-12-20',
  status: 'IN_PROGRESS',
  is_active: true,
  week_count: 10,
  has_submitted_results: true,
  created_at: '2026-08-01T02:00:00Z',
  updated_at: '2026-11-16T14:30:00Z',
};

describe('toLeagueSession', () => {
  it('maps every snake_case field to its camelCase name', () => {
    const expected: LeagueSession = {
      id: 'session-1',
      leagueId: 'league-1',
      name: 'Fall 2026',
      sessionType: 'FALL',
      seasonYear: 2026,
      startsOn: '2026-09-01',
      endsOn: '2026-12-20',
      status: 'IN_PROGRESS',
      isActive: true,
      weekCount: 10,
      hasSubmittedResults: true,
      createdAt: '2026-08-01T02:00:00Z',
      updatedAt: '2026-11-16T14:30:00Z',
    };

    expect(toLeagueSession(SESSION_WIRE)).toStrictEqual(expected);
  });
});

describe('toSessionWeek', () => {
  it('maps a week', () => {
    const week = toSessionWeek({
      week_no: 3,
      match_count: 4,
      submitted_count: 2,
      first_scheduled_at: '2026-09-15T12:00:00Z',
    });

    expect(week).toStrictEqual({
      weekNo: 3,
      matchCount: 4,
      submittedCount: 2,
      firstScheduledAt: '2026-09-15T12:00:00Z',
    });
  });
});

describe('toLeagueSessionBody', () => {
  // league-be rejects unknown fields, so a camelCase key here would fail the whole request.
  it('sends a full input in snake_case', () => {
    const body = toLeagueSessionBody({
      name: 'Spring 2027',
      sessionType: 'SPRING',
      seasonYear: 2027,
      startsOn: '2027-01-10',
      endsOn: '2027-04-30',
      status: 'DRAFT',
      isActive: false,
    });

    expect(JSON.parse(JSON.stringify(body))).toStrictEqual({
      name: 'Spring 2027',
      session_type: 'SPRING',
      season_year: 2027,
      starts_on: '2027-01-10',
      ends_on: '2027-04-30',
      status: 'DRAFT',
      is_active: false,
    });
  });

  it('sends only the fields a patch changes', () => {
    const body = toLeagueSessionBody({ name: 'Fall 2026 (Open)' });

    expect(JSON.parse(JSON.stringify(body))).toStrictEqual({ name: 'Fall 2026 (Open)' });
  });
});
