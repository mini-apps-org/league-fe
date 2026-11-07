import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import { LeagueAPI } from '@/api/leagueAPI';
import type { ApiRequestError } from '@/lib/errors';
import { isLookupableMemberId } from '@/lib/member-id';
import type { MemberPreview } from '@/types/league';
import { ME_QUERY_KEY } from './useMe';

// retry:false because "no such member" is an answer, not a flake, and repeating it just makes
// the user wait to be told the same thing.
export function useMemberPreview(memberId: string): UseQueryResult<MemberPreview> {
  return useQuery({
    queryKey: ['member-preview', memberId],
    queryFn: () => {
      return LeagueAPI.fetchMemberPreview(memberId);
    },
    enabled: isLookupableMemberId(memberId),
    retry: false,
  });
}

export function useLinkMember(): UseMutationResult<void, ApiRequestError, string> {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, string>({
    mutationFn: (memberId) => {
      return LeagueAPI.linkMember(memberId);
    },
    // Awaited, and therefore finished before the caller's own onSuccess runs. The gate reads
    // playerId from the cached `me`, so navigating on a stale cache would bounce the user
    // straight back to this screen — the most likely bug in this flow.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}
