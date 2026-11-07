import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { AuthAPI } from '@/api/authAPI';
import type { ApiRequestError } from '@/lib/errors';
import { LOGIN_PATH } from '@/lib/navigate';
import type { MeResponse } from '@/types/auth';

export const ME_QUERY_KEY = ['me'] as const;

// The session check: `sid` is HttpOnly, so the SPA has to ask. retry:false because a 401
// here is an answer, not a flake.
export function useMe(): UseQueryResult<MeResponse> {
  return useQuery<MeResponse>({
    queryKey: ME_QUERY_KEY,
    queryFn: () => {
      return AuthAPI.fetchMe();
    },
    retry: false,
  });
}

// ApiRequestError, not Error: the axios interceptor normalises every failure before this.
export function useLogout(): UseMutationResult<void, ApiRequestError, void> {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, ApiRequestError, void>({
    mutationFn: () => {
      return AuthAPI.logout();
    },
    // onSettled, not onSuccess: the cookies are gone either way, and a cached `me` would
    // show a signed-in header to a signed-out user.
    onSettled: () => {
      queryClient.clear();
      void navigate(LOGIN_PATH, { replace: true });
    },
  });
}
