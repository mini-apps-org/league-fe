import { generatePath } from 'react-router';

import { ROUTES } from '@/utils';

// The team details page's selected division: league-be has no endpoint listing a team's
// divisions, so the division travels in the URL.
export const TEAM_DIVISION_PARAM = 'division';

export const getTeamPath = (teamId: string, divisionId: string): string => {
  const path = generatePath(ROUTES.ADMIN_TEAM, { id: teamId });

  if (divisionId === '') {
    return path;
  }

  return `${path}?${new URLSearchParams({ [TEAM_DIVISION_PARAM]: divisionId }).toString()}`;
};
