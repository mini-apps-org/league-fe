import { queryOptions } from '@tanstack/react-query';

import { AuthAPI } from '@/api/authAPI';

export const authQueries = {
  // The session check: `sid` is HttpOnly, so the SPA has to ask. retry:false because a 401
  // here is an answer, not a flake.
  me: () => {
    return queryOptions({
      queryKey: ['auth', 'me'],
      queryFn: () => {
        return AuthAPI.fetchMe();
      },
      retry: false,
    });
  },
};
