import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { LeagueAPI } from '@/api/leagueAPI';
import type { ApiRequestError } from '@/lib/errors';
import type {
  IndividualMatch,
  PutUpInput,
  ResultInput,
  SkillLevelInput,
  TeamMatchDetail,
} from '@/types/league';

// Every mutation invalidates the night, because the triggers change more than the row that
// was written: a saved result also moves team_matches points and players_stats.
function useNightInvalidation(teamMatchId: string): () => void {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['team-match', teamMatchId] });
    void queryClient.invalidateQueries({ queryKey: ['available'] });
    void queryClient.invalidateQueries({ queryKey: ['fixtures'] });
  };
}

export function usePutUp(
  teamMatchId: string,
): UseMutationResult<IndividualMatch, ApiRequestError, PutUpInput> {
  const invalidate = useNightInvalidation(teamMatchId);

  return useMutation<IndividualMatch, ApiRequestError, PutUpInput>({
    mutationFn: (input) => {
      return LeagueAPI.putUpPlayer(teamMatchId, input);
    },
    onSuccess: invalidate,
    // A rejected put-up means the list this screen rendered is stale, so refetch on failure
    // too rather than leaving a dead button.
    onError: invalidate,
  });
}

interface SaveResultVariables {
  individualMatchId: string;
  input: ResultInput;
}

export function useSaveResult(
  teamMatchId: string,
): UseMutationResult<IndividualMatch, ApiRequestError, SaveResultVariables> {
  const invalidate = useNightInvalidation(teamMatchId);

  return useMutation<IndividualMatch, ApiRequestError, SaveResultVariables>({
    mutationFn: (variables) => {
      return LeagueAPI.saveResult(variables.individualMatchId, variables.input);
    },
    onSuccess: invalidate,
  });
}

export function useSubmitNight(
  teamMatchId: string,
): UseMutationResult<TeamMatchDetail, ApiRequestError, void> {
  const invalidate = useNightInvalidation(teamMatchId);

  return useMutation<TeamMatchDetail, ApiRequestError, void>({
    mutationFn: () => {
      return LeagueAPI.submitNight(teamMatchId);
    },
    onSuccess: invalidate,
  });
}

interface AddRosterVariables {
  teamId: string;
  playerId: string;
}

export function useAddRosterPlayer(
  teamMatchId: string,
): UseMutationResult<void, ApiRequestError, AddRosterVariables> {
  const invalidate = useNightInvalidation(teamMatchId);

  return useMutation<void, ApiRequestError, AddRosterVariables>({
    mutationFn: (variables) => {
      return LeagueAPI.addRosterPlayer(variables.teamId, variables.playerId);
    },
    onSuccess: invalidate,
  });
}

interface SkillLevelVariables {
  playerId: string;
  input: SkillLevelInput;
}

export function useChangeSkillLevel(): UseMutationResult<
  unknown,
  ApiRequestError,
  SkillLevelVariables
> {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiRequestError, SkillLevelVariables>({
    mutationFn: (variables) => {
      return LeagueAPI.changeSkillLevel(variables.playerId, variables.input);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['players'] });
      void queryClient.invalidateQueries({
        queryKey: ['skill-level-history', variables.playerId],
      });
    },
  });
}

// Admin transfer: the same roster endpoint, but there is no team night to invalidate, so it
// refreshes the player list instead. A transfer closes the old roster row and opens a new
// one server-side, which is what keeps a played match reconstructable.
export function useTransferPlayer(): UseMutationResult<void, ApiRequestError, AddRosterVariables> {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, AddRosterVariables>({
    mutationFn: (variables) => {
      return LeagueAPI.addRosterPlayer(variables.teamId, variables.playerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['players'] });
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
