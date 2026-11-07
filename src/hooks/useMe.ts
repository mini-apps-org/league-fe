import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { AuthAPI } from '@/api/authAPI';
import type { ApiRequestError } from '@/lib/errors';
import { LOGIN_PATH } from '@/lib/navigate';
import type { MeResponse } from '@/types/auth';

export const ME_QUERY_KEY = ['me'] as const;

// GET /api/v1/me is the session check: the `sid` cookie is HttpOnly, so the SPA cannot read
// its own session and has to ask. retry:false because a 401 here is an answer, not a
// failure worth repeating.
export function useMe(): UseQueryResult<MeResponse> {
  return useQuery<MeResponse>({
    queryKey: ME_QUERY_KEY,
    queryFn: () => {
      return AuthAPI.fetchMe();
    },
    retry: false,
  });
}

// The error type is ApiRequestError, not Error: the axios interceptor normalises every
// failure into one before it reaches here.
export function useLogout(): UseMutationResult<void, ApiRequestError, void> {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, ApiRequestError, void>({
    mutationFn: () => {
      return AuthAPI.logout();
    },
    // onSettled, not onSuccess: the cookies are gone either way once the request has been
    // attempted, so keeping a cached `me` around would show a signed-in header to a
    // signed-out user.
    onSettled: () => {
      queryClient.clear();
      void navigate(LOGIN_PATH, { replace: true });
    },
  });
}
