import { i18next } from '@/i18n';

import { isConflictError, messageFor } from './errors';

export type TeamOperation =
  | 'create'
  | 'update'
  | 'deletePermanently'
  | 'addDivision'
  | 'removeDivision'
  | 'addPlayer'
  | 'transfer'
  | 'removePlayer';

// league-be serves every team and roster rule as the generic 409001, so the operation that
// failed is what says which rule it was: a duplicate code on create, the captain on remove.
export const getTeamErrorMessage = (err: unknown, operation: TeamOperation): string => {
  if (isConflictError(err)) {
    return i18next.t(`teams.conflict.${operation}`);
  }

  return messageFor(err);
};
