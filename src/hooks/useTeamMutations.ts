import type { QueryKey, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TeamsAPI } from '@/api/teamsAPI';
import type { ApiRequestError } from '@/lib/errors';
import { invalidateKeys } from '@/lib/query-client';
import { TEAM_KEYS, teamQueries } from '@/queries/teams';
import type {
  BulkDeleteTeamsResult,
  CreateTeamInput,
  DivisionTeam,
  RosterEntryRef,
  RosterPlayer,
  Team,
  TransferRosterPlayerInput,
  UpdateTeamInput,
} from '@/types/teams';

export interface UpdateTeamVariables {
  teamId: string;
  input: UpdateTeamInput;
}

export interface TeamDivisionVariables {
  teamId: string;
  divisionId: string;
}

export interface TransferRosterPlayerVariables {
  ref: RosterEntryRef;
  input: TransferRosterPlayerInput;
}

const rosterKeyOf = (teamId: string): QueryKey => {
  return [...TEAM_KEYS.ROSTERS, teamId];
};

export const useCreateTeam = (): UseMutationResult<Team, ApiRequestError, CreateTeamInput> => {
  const queryClient = useQueryClient();

  return useMutation<Team, ApiRequestError, CreateTeamInput>({
    mutationFn: (input) => {
      return TeamsAPI.createTeam(input);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

// A captain change also moves is_captain on the roster rows.
export const useUpdateTeam = (): UseMutationResult<Team, ApiRequestError, UpdateTeamVariables> => {
  const queryClient = useQueryClient();

  return useMutation<Team, ApiRequestError, UpdateTeamVariables>({
    mutationFn: ({ teamId, input }) => {
      return TeamsAPI.updateTeam(teamId, input);
    },
    onSuccess: async (team) => {
      queryClient.setQueryData(teamQueries.detail(team.id).queryKey, team);
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS, rosterKeyOf(team.id)]);
    },
  });
};

export const useDeleteTeam = (): UseMutationResult<void, ApiRequestError, string> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, string>({
    mutationFn: (teamId) => {
      return TeamsAPI.deleteTeam(teamId);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

export const useDeleteTeamPermanently = (): UseMutationResult<void, ApiRequestError, string> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, string>({
    mutationFn: (teamId) => {
      return TeamsAPI.deleteTeamPermanently(teamId);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

export const useBulkDeleteTeams = (): UseMutationResult<
  BulkDeleteTeamsResult,
  ApiRequestError,
  string[]
> => {
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteTeamsResult, ApiRequestError, string[]>({
    mutationFn: (teamIds) => {
      return TeamsAPI.bulkDeleteTeams(teamIds);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

export const useBulkDeleteTeamsPermanently = (): UseMutationResult<
  BulkDeleteTeamsResult,
  ApiRequestError,
  string[]
> => {
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteTeamsResult, ApiRequestError, string[]>({
    mutationFn: (teamIds) => {
      return TeamsAPI.bulkDeleteTeamsPermanently(teamIds);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

// Lists filter by division_id, so entering or leaving a division changes which lists hold it.
export const useAddTeamDivision = (): UseMutationResult<
  DivisionTeam,
  ApiRequestError,
  TeamDivisionVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<DivisionTeam, ApiRequestError, TeamDivisionVariables>({
    mutationFn: ({ teamId, divisionId }) => {
      return TeamsAPI.addTeamDivision(teamId, divisionId);
    },
    onSuccess: async () => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS]);
    },
  });
};

export const useRemoveTeamDivision = (): UseMutationResult<
  void,
  ApiRequestError,
  TeamDivisionVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, TeamDivisionVariables>({
    mutationFn: ({ teamId, divisionId }) => {
      return TeamsAPI.removeTeamDivision(teamId, divisionId);
    },
    onSuccess: async (_, { teamId }) => {
      await invalidateKeys(queryClient, [TEAM_KEYS.LISTS, rosterKeyOf(teamId)]);
    },
  });
};

export const useAddRosterPlayer = (): UseMutationResult<
  RosterPlayer,
  ApiRequestError,
  RosterEntryRef
> => {
  const queryClient = useQueryClient();

  return useMutation<RosterPlayer, ApiRequestError, RosterEntryRef>({
    mutationFn: (ref) => {
      return TeamsAPI.addRosterPlayer(ref);
    },
    onSuccess: async (_, { teamId }) => {
      await invalidateKeys(queryClient, [rosterKeyOf(teamId)]);
    },
  });
};

// Both rosters change: the player leaves one and joins the other.
export const useTransferRosterPlayer = (): UseMutationResult<
  RosterPlayer,
  ApiRequestError,
  TransferRosterPlayerVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<RosterPlayer, ApiRequestError, TransferRosterPlayerVariables>({
    mutationFn: ({ ref, input }) => {
      return TeamsAPI.transferRosterPlayer(ref, input);
    },
    onSuccess: async (_, { ref, input }) => {
      await invalidateKeys(queryClient, [rosterKeyOf(ref.teamId), rosterKeyOf(input.team_id)]);
    },
  });
};

export const useRemoveRosterPlayer = (): UseMutationResult<
  void,
  ApiRequestError,
  RosterEntryRef
> => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, RosterEntryRef>({
    mutationFn: (ref) => {
      return TeamsAPI.removeRosterPlayer(ref);
    },
    onSuccess: async (_, { teamId }) => {
      await invalidateKeys(queryClient, [rosterKeyOf(teamId)]);
    },
  });
};
