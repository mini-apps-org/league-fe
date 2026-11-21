import { setupServer } from 'msw/node';

import { handlers } from './handlers';
import { leagueHandlers } from './mocks/handlers';

export const server = setupServer(...handlers, ...leagueHandlers);
