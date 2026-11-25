import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ConfirmDrawer } from '@/components/league/ConfirmDrawer';
import { useRemoveTeamDivision } from '@/hooks/useTeamMutations';
import { getTeamErrorMessage } from '@/lib/team-errors';
import type { Team } from '@/types/teams';

interface RemoveDivisionDrawerProps {
  team: Team;
  divisionId: string;
  onClose: () => void;
  onRemoved: () => void;
}

// league-be refuses (409) while the team has matches in the division.
export const RemoveDivisionDrawer = ({
  team,
  divisionId,
  onClose,
  onRemoved,
}: RemoveDivisionDrawerProps) => {
  const { t } = useTranslation();
  const removeDivision = useRemoveTeamDivision();

  const handleConfirm = async () => {
    try {
      await removeDivision.mutateAsync({ teamId: team.id, divisionId });
      toast.success(t('teams.removeDivision.success', { team: team.name }));
      onRemoved();
    } catch {
      // Shown in the drawer.
    }
  };

  return (
    <ConfirmDrawer
      title={t('teams.removeDivision.title', { team: team.name })}
      description={t('teams.removeDivision.description')}
      confirmLabel={t('teams.removeDivision.submit')}
      isPending={removeDivision.isPending}
      errorMessage={
        removeDivision.isError
          ? getTeamErrorMessage(removeDivision.error, 'removeDivision')
          : undefined
      }
      onClose={onClose}
      onConfirm={() => {
        void handleConfirm();
      }}
    />
  );
};
