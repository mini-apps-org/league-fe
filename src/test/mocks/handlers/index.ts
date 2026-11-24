import { individualMatchHandlers } from './individual-matches';
import { lookupHandlers } from './lookups';
import { sessionHandlers } from './sessions';
import { teamMatchHandlers } from './team-matches';

export const leagueHandlers = [
  ...sessionHandlers,
  ...lookupHandlers,
  ...teamMatchHandlers,
  ...individualMatchHandlers,
];
