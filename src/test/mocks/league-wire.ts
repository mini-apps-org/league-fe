import type { LeagueSession, SessionInput, SessionWeek } from '@/types/league';
import type {
  LeagueSessionBodyWire,
  LeagueSessionWeekWire,
  LeagueSessionWire,
} from '@/types/league-wire';

// The inverse of src/api/league-session-mappers.ts: the mock server answers in league-be's
// snake_case, so a test exercises the app's real mapping.
export const toLeagueSessionWire = (session: LeagueSession): LeagueSessionWire => {
  return {
    id: session.id,
    league_id: session.leagueId,
    name: session.name,
    session_type: session.sessionType,
    season_year: session.seasonYear,
    starts_on: session.startsOn,
    ends_on: session.endsOn,
    status: session.status,
    is_active: session.isActive,
    week_count: session.weekCount,
    has_submitted_results: session.hasSubmittedResults,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
};

export const toSessionWeekWire = (week: SessionWeek): LeagueSessionWeekWire => {
  return {
    week_no: week.weekNo,
    match_count: week.matchCount,
    submitted_count: week.submittedCount,
    first_scheduled_at: week.firstScheduledAt,
  };
};

// A field the body leaves out keeps the row's value, as league-be's PATCH merge does.
export const applyLeagueSessionBody = <Row extends SessionInput>(
  row: Row,
  body: LeagueSessionBodyWire,
): Row => {
  return {
    ...row,
    name: body.name ?? row.name,
    sessionType: body.session_type ?? row.sessionType,
    seasonYear: body.season_year ?? row.seasonYear,
    startsOn: body.starts_on ?? row.startsOn,
    endsOn: body.ends_on ?? row.endsOn,
    status: body.status ?? row.status,
    isActive: body.is_active ?? row.isActive,
  };
};
