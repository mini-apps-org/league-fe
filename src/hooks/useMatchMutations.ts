import type { QueryClient, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LeagueAdminAPI } from '@/api/leagueAdminAPI';
import type { ApiRequestError } from '@/lib/errors';
import { leagueQueries } from '@/queries/league';
import type {
  AdminTeamMatchDetail,
  IndividualMatch,
  IndividualMatchPatch,
  TeamMatchInput,
  TeamMatchPatch,
} from '@/types/league';

export interface UpdateTeamMatchVariables {
  teamMatchId: string;
  patch: TeamMatchPatch;
}

// A 204 carries no body, so the caller passes the session whose week counts go stale.
export interface DeleteTeamMatchVariables {
  teamMatchId: string;
  sessionId: string;
}

export interface UpdateIndividualMatchVariables {
  individualMatchId: string;
  teamMatchId: string;
  patch: IndividualMatchPatch;
}

export interface ResetIndividualMatchVariables {
  individualMatchId: string;
  teamMatchId: string;
}

// Lists and week counts both move when a night is added, edited or removed.
const invalidateSessionMatches = async (
  queryClient: QueryClient,
  sessionId: string,
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: leagueQueries.teamMatchLists() }),
    queryClient.invalidateQueries({ queryKey: leagueQueries.sessionWeeks(sessionId).queryKey }),
  ]);
};

// Individual-match points roll up into the team score shown on both the detail and the lists.
const invalidateNight = async (queryClient: QueryClient, teamMatchId: string): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: leagueQueries.teamMatch(teamMatchId).queryKey }),
    queryClient.invalidateQueries({ queryKey: leagueQueries.teamMatchLists() }),
  ]);
};

export const useCreateTeamMatch = (): UseMutationResult<
  AdminTeamMatchDetail,
  ApiRequestError,
  TeamMatchInput
> => {
  const queryClient = useQueryClient();

  return useMutation<AdminTeamMatchDetail, ApiRequestError, TeamMatchInput>({
    mutationFn: (input) => {
      return LeagueAdminAPI.createTeamMatch(input);
    },
    onSuccess: async (teamMatch) => {
      queryClient.setQueryData(leagueQueries.teamMatch(teamMatch.id).queryKey, teamMatch);
      await invalidateSessionMatches(queryClient, teamMatch.sessionId);
    },
  });
};

export const useUpdateTeamMatch = (): UseMutationResult<
  AdminTeamMatchDetail,
  ApiRequestError,
  UpdateTeamMatchVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<AdminTeamMatchDetail, ApiRequestError, UpdateTeamMatchVariables>({
    mutationFn: ({ teamMatchId, patch }) => {
      return LeagueAdminAPI.updateTeamMatch(teamMatchId, patch);
    },
    onSuccess: async (teamMatch) => {
      queryClient.setQueryData(leagueQueries.teamMatch(teamMatch.id).queryKey, teamMatch);
      await invalidateSessionMatches(queryClient, teamMatch.sessionId);
    },
  });
};

export const useDeleteTeamMatch = (): UseMutationResult<
  void,
  ApiRequestError,
  DeleteTeamMatchVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, DeleteTeamMatchVariables>({
    mutationFn: ({ teamMatchId }) => {
      return LeagueAdminAPI.deleteTeamMatch(teamMatchId);
    },
    onSuccess: async (_, { teamMatchId, sessionId }) => {
      queryClient.removeQueries({ queryKey: leagueQueries.teamMatch(teamMatchId).queryKey });
      await invalidateSessionMatches(queryClient, sessionId);
    },
  });
};

export const useUpdateIndividualMatch = (): UseMutationResult<
  IndividualMatch,
  ApiRequestError,
  UpdateIndividualMatchVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<IndividualMatch, ApiRequestError, UpdateIndividualMatchVariables>({
    mutationFn: ({ individualMatchId, patch }) => {
      return LeagueAdminAPI.updateIndividualMatch(individualMatchId, patch);
    },
    onSuccess: async (_, { teamMatchId }) => {
      await invalidateNight(queryClient, teamMatchId);
    },
  });
};

export const useResetIndividualMatch = (): UseMutationResult<
  void,
  ApiRequestError,
  ResetIndividualMatchVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, ResetIndividualMatchVariables>({
    mutationFn: ({ individualMatchId }) => {
      return LeagueAdminAPI.resetIndividualMatch(individualMatchId);
    },
    onSuccess: async (_, { teamMatchId }) => {
      await invalidateNight(queryClient, teamMatchId);
    },
  });
};
