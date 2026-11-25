import type { QueryKey } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }

        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

// Awaited, so the lists are fresh before the caller's onSuccess closes a sheet over them.
export const invalidateKeys = async (client: QueryClient, keys: QueryKey[]): Promise<void> => {
  await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
};
