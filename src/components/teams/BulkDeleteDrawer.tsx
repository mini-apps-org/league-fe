import { useTranslation } from 'react-i18next';

import { ConfirmDrawer } from '@/components/league/ConfirmDrawer';
import type { BulkDeleteOutcome } from '@/components/teams/BulkDeleteResult';
import { useBulkDeleteTeams } from '@/hooks/useTeamMutations';
import { messageFor, messageForCode } from '@/lib/errors';
import type { Team } from '@/types/teams';

interface BulkDeleteDrawerProps {
  teams: Team[];
  onClose: () => void;
  onDeleted: (outcome: BulkDeleteOutcome) => void;
}

// The selection can only hold loaded rows, so it never reaches league-be's 100-id limit
// unless several pages of 50 are loaded and all selected; the server's 400 covers that.
export const BulkDeleteDrawer = ({ teams, onClose, onDeleted }: BulkDeleteDrawerProps) => {
  const { t } = useTranslation();
  const bulkDelete = useBulkDeleteTeams();

  const handleConfirm = async () => {
    // Read names before the request: the deleted rows leave the cached list with it.
    const teamsById = new Map(teams.map((team) => [team.id, team]));

    try {
      const result = await bulkDelete.mutateAsync(teams.map((team) => team.id));
      onDeleted({
        deletedCount: result.deleted_ids.length,
        failures: result.failed.map((failure) => ({
          id: failure.id,
          name: teamsById.get(failure.id)?.name ?? failure.id,
          teamCode: teamsById.get(failure.id)?.team_code ?? '',
          message: messageForCode(failure.code),
        })),
      });
    } catch {
      // The drawer shows the error and stays open.
    }
  };

  return (
    <ConfirmDrawer
      title={t('teams.bulk.confirmTitle', { count: teams.length })}
      description={t('teams.bulk.confirmBody')}
      confirmLabel={t('teams.bulk.delete', { count: teams.length })}
      isPending={bulkDelete.isPending}
      errorMessage={bulkDelete.isError ? messageFor(bulkDelete.error) : undefined}
      onClose={onClose}
      onConfirm={() => {
        void handleConfirm();
      }}
    >
      <ul className="ml-4 list-disc text-sm">
        {teams.map((team) => (
          <li key={team.id}>{`${team.name} · ${team.team_code}`}</li>
        ))}
      </ul>
    </ConfirmDrawer>
  );
};
