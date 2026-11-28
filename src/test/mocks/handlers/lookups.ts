import { http } from 'msw';

import { ENDPOINTS } from '@/api/endpoints';
import type { RosterEntry, TeamOption } from '@/types/league';

import { apiUrl, listEnvelope, notFound, validationFailed } from '../http';
import { getLeagueStore } from '../league-store';

export const lookupHandlers = [
  // session_id is the admin contract; season_id is what the parked schedule screen sends.
  http.get(apiUrl(ENDPOINTS.DIVISIONS), ({ request }) => {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id') ?? searchParams.get('season_id');
    if (!sessionId) {
      return validationFailed();
    }

    return listEnvelope(
      getLeagueStore().divisions.filter((division) => division.seasonId === sessionId),
    );
  }),

  http.get(apiUrl(ENDPOINTS.TEAMS), ({ request }) => {
    const divisionId = new URL(request.url).searchParams.get('division_id');
    if (!divisionId) {
      return validationFailed();
    }

    const teams: TeamOption[] = getLeagueStore()
      .teams.filter((team) => team.divisionId === divisionId)
      .map((team) => ({ id: team.id, teamNumber: team.teamNumber, name: team.name }));

    return listEnvelope(teams);
  }),

  http.get<{ teamId: string }>(apiUrl(`${ENDPOINTS.TEAMS}/:teamId/roster`), ({ params }) => {
    const store = getLeagueStore();
    if (!store.teams.some((team) => team.id === params.teamId)) {
      return notFound();
    }

    const roster: RosterEntry[] = store.players
      .filter((player) => player.teamId === params.teamId)
      .map((player) => ({
        playerId: player.playerId,
        fullName: player.fullName,
        skillLevel: player.skillLevel,
      }));

    return listEnvelope(roster);
  }),

  http.get(apiUrl(ENDPOINTS.VENUES), () => {
    return listEnvelope(getLeagueStore().venues);
  }),
];
