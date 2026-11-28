import { queryOptions } from '@tanstack/react-query';

import { DivisionsAPI } from '@/api/divisionsAPI';

export const DIVISION_KEYS = {
  OPTIONS: ['divisions', 'options'],
} as const;

export const divisionQueries = {
  options: () => {
    return queryOptions({
      queryKey: DIVISION_KEYS.OPTIONS,
      queryFn: () => {
        return DivisionsAPI.fetchDivisionOptions();
      },
    });
  },
};
