import { setupWorker } from 'msw/browser';

import { sessionHandlers } from './handlers/sessions';
import { teamLookupHandlers } from './handlers/team-lookups';

// Dev only: the session routes and the Teams pickers' lists, which league-be does not serve
// yet. Everything else, sign-in, /me and the teams themselves included, passes through to the
// real backend.
export const worker = setupWorker(...sessionHandlers, ...teamLookupHandlers);
// export const worker = setupWorker(...sessionHandlers,);
