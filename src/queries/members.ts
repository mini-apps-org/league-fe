import { queryOptions } from '@tanstack/react-query';

import { LeagueAPI } from '@/api/leagueAPI';
import { isLookupableMemberId } from '@/lib/member-id';

export const memberQueries = {
  // retry:false because "no such member" is an answer, not a flake.
  preview: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', 'preview', memberId],
      queryFn: () => {
        return LeagueAPI.fetchMemberPreview(memberId);
      },
      enabled: isLookupableMemberId(memberId),
      retry: false,
    });
  },
};
