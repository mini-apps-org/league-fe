import { http, passthrough } from 'msw';

import { ENDPOINTS } from '@/api/endpoints';
import type { DivisionOption } from '@/types/divisions';
import type { VenueOption } from '@/types/league';

import { apiUrl, listEnvelope } from '../http';

// Dev only: the Teams pickers' lists, until league-be serves GET /divisions and GET /venues.
// Teams themselves stay real, so every id here must exist in the local database: a made-up id
// would make POST /teams fail on its foreign key.
const DIVISION_OPTIONS: DivisionOption[] = [
  {
    id: '3f4d7958-4bda-46b7-b515-3319dc9b1cef',
    name: '8-Ball Open',
    // The division's real session isn't known here; only the name above is shown in the group.
    session_id: 'local-session',
    session_name: 'Local session',
  },
];

// Empty until real venue ids from the local database are added, for the reason above.
const VENUE_OPTIONS: VenueOption[] = [];

export const teamLookupHandlers = [
  http.get(apiUrl(ENDPOINTS.DIVISIONS), ({ request }) => {
    // A session's divisions belong to the sessions screen's own contract; leave those alone.
    if (new URL(request.url).searchParams.has('session_id')) {
      return passthrough();
    }

    return listEnvelope(DIVISION_OPTIONS);
  }),

  http.get(apiUrl(ENDPOINTS.VENUES), () => {
    return listEnvelope(VENUE_OPTIONS);
  }),
];
