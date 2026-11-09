import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { AuthAPI } from '@/api/authAPI';
import type { ApiRequestError } from '@/lib/errors';
import { LOGIN_PATH } from '@/lib/navigate';
import { authQueries } from '@/queries/auth';
import type { MeResponse } from '@/types/auth';

export function useMe(): UseQueryResult<MeResponse> {
  return useQuery(authQueries.me());
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
