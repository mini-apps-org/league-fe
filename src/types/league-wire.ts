import type { SessionStatus, SessionType } from './league';

// league-be's sessions JSON, one field per json tag in internal/sessions/model_handlers.go.
// It is snake_case on the wire; src/api/league-session-mappers.ts converts it to the camelCase
// types the screens use.
export interface LeagueSessionWire {
  id: string;
  league_id: string;
  name: string;
  session_type: SessionType;
  season_year: number;
  starts_on: string;
  ends_on: string;
  status: SessionStatus;
  is_active: boolean;
  week_count: number;
  has_submitted_results: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeagueSessionWeekWire {
  week_no: number;
  match_count: number;
  submitted_count: number;
  first_scheduled_at: string;
}

export interface LeagueSessionBodyWire {
  name?: string;
  session_type?: SessionType;
  season_year?: number;
  starts_on?: string;
  ends_on?: string;
  status?: SessionStatus;
  is_active?: boolean;
}
