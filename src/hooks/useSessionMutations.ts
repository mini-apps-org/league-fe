import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LeagueAdminAPI } from '@/api/leagueAdminAPI';
import type { ApiRequestError } from '@/lib/errors';
import { leagueQueries } from '@/queries/league';
import type { LeagueSession, SessionInput, SessionPatch } from '@/types/league';

export interface UpdateSessionVariables {
  sessionId: string;
  patch: SessionPatch;
}

export const useCreateSession = (): UseMutationResult<
  LeagueSession,
  ApiRequestError,
  SessionInput
> => {
  const queryClient = useQueryClient();

  return useMutation<LeagueSession, ApiRequestError, SessionInput>({
    mutationFn: (input) => {
      return LeagueAdminAPI.createSession(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leagueQueries.sessionLists() });
    },
  });
};

export const useUpdateSession = (): UseMutationResult<
  LeagueSession,
  ApiRequestError,
  UpdateSessionVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<LeagueSession, ApiRequestError, UpdateSessionVariables>({
    mutationFn: ({ sessionId, patch }) => {
      return LeagueAdminAPI.updateSession(sessionId, patch);
    },
    onSuccess: async (session) => {
      queryClient.setQueryData(leagueQueries.session(session.id).queryKey, session);
      await queryClient.invalidateQueries({ queryKey: leagueQueries.sessionLists() });
    },
  });
};

export const useDeleteSession = (): UseMutationResult<void, ApiRequestError, string> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, string>({
    mutationFn: (sessionId) => {
      return LeagueAdminAPI.deleteSession(sessionId);
    },
    // The delete cascades to divisions and matches, so their cached lists go stale too.
    onSuccess: async (_, sessionId) => {
      queryClient.removeQueries({ queryKey: leagueQueries.sessionDetail(sessionId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leagueQueries.sessionLists() }),
        queryClient.invalidateQueries({ queryKey: leagueQueries.teamMatchLists() }),
      ]);
    },
  });
};
