import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ConfirmDrawer } from '@/components/league/ConfirmDrawer';
import { useRemoveRosterPlayer } from '@/hooks/useTeamMutations';
import { getTeamErrorMessage } from '@/lib/team-errors';
import type { RosterPlayer, Team } from '@/types/teams';

interface RemovePlayerDrawerProps {
  team: Team;
  divisionId: string;
  player: RosterPlayer;
  onClose: () => void;
}

export const RemovePlayerDrawer = ({
  team,
  divisionId,
  player,
  onClose,
}: RemovePlayerDrawerProps) => {
  const { t } = useTranslation();
  const removePlayer = useRemoveRosterPlayer();

  const handleConfirm = async () => {
    try {
      await removePlayer.mutateAsync({ teamId: team.id, divisionId, playerId: player.player_id });
      toast.success(t('teams.removePlayer.success', { name: player.full_name }));
      onClose();
    } catch {
      // Shown in the drawer.
    }
  };

  return (
    <ConfirmDrawer
      title={t('teams.removePlayer.title', { name: player.full_name })}
      description={t('teams.removePlayer.description', { team: team.name })}
      confirmLabel={t('teams.removePlayer.submit')}
      isPending={removePlayer.isPending}
      errorMessage={
        removePlayer.isError ? getTeamErrorMessage(removePlayer.error, 'removePlayer') : undefined
      }
      onClose={onClose}
      onConfirm={() => {
        void handleConfirm();
      }}
    />
  );
};
