import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LeagueAPI } from '@/api/leagueAPI';
import type { ApiRequestError } from '@/lib/errors';
import { authQueries } from '@/queries/auth';
import { memberQueries } from '@/queries/members';
import type { MemberPreview } from '@/types/league';

export function useMemberPreview(memberId: string): UseQueryResult<MemberPreview> {
  return useQuery(memberQueries.preview(memberId));
}

export function useLinkMember(): UseMutationResult<void, ApiRequestError, string> {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, string>({
    mutationFn: (memberId) => {
      return LeagueAPI.linkMember(memberId);
    },
    // Awaited, so it finishes before the caller's onSuccess. The gate reads playerId from
    // the cached `me`; navigating on a stale cache would bounce the user back here.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueries.me().queryKey });
    },
  });
}
