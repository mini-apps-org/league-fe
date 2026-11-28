import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { divisionQueries } from '@/queries/divisions';
import type { DivisionOption } from '@/types/divisions';

export const useDivisionOptions = (): UseQueryResult<DivisionOption[]> => {
  return useQuery(divisionQueries.options());
};
