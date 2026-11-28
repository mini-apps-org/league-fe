// One entry of GET /divisions, the pickers' proposed contract: league-be does not list
// divisions yet. A division only exists inside a session, so it carries the session's name.
export interface DivisionOption {
  id: string;
  name: string;
  session_id: string;
  session_name: string;
}
