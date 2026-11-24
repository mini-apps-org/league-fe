import type { LeagueSession, SessionPatch, SessionWeek } from '@/types/league';
import type {
  LeagueSessionBodyWire,
  LeagueSessionWeekWire,
  LeagueSessionWire,
} from '@/types/league-wire';

export const toLeagueSession = (wire: LeagueSessionWire): LeagueSession => {
  return {
    id: wire.id,
    leagueId: wire.league_id,
    name: wire.name,
    sessionType: wire.session_type,
    seasonYear: wire.season_year,
    startsOn: wire.starts_on,
    endsOn: wire.ends_on,
    status: wire.status,
    isActive: wire.is_active,
    weekCount: wire.week_count,
    hasSubmittedResults: wire.has_submitted_results,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
};

export const toSessionWeek = (wire: LeagueSessionWeekWire): SessionWeek => {
  return {
    weekNo: wire.week_no,
    matchCount: wire.match_count,
    submittedCount: wire.submitted_count,
    firstScheduledAt: wire.first_scheduled_at,
  };
};

// Spelled out field by field so a form object with extra keys can't leak into a request:
// league-be rejects unknown fields with 400001. Undefined keys are dropped by JSON.stringify,
// which keeps a PATCH partial.
export const toLeagueSessionBody = (input: SessionPatch): LeagueSessionBodyWire => {
  return {
    name: input.name,
    session_type: input.sessionType,
    season_year: input.seasonYear,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    status: input.status,
    is_active: input.isActive,
  };
};
