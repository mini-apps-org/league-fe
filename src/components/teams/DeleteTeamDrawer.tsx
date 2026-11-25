import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ConfirmDrawer } from '@/components/league/ConfirmDrawer';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { useDeleteTeam, useDeleteTeamPermanently } from '@/hooks/useTeamMutations';
import { messageFor } from '@/lib/errors';
import { getTeamErrorMessage } from '@/lib/team-errors';
import type { Team } from '@/types/teams';

interface DeleteTeamDrawerProps {
  team: Team;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteTeamDrawer = ({ team, onClose, onDeleted }: DeleteTeamDrawerProps) => {
  const { t } = useTranslation();
  const permanentId = useId();
  const [isPermanent, setIsPermanent] = useState(false);
  const deleteTeam = useDeleteTeam();
  const deleteTeamPermanently = useDeleteTeamPermanently();
  const isPending = deleteTeam.isPending || deleteTeamPermanently.isPending;

  // league-be only deletes permanently a team already soft-deleted, so it is two calls. If the
  // second fails (the team has fixtures), the team is still gone from the league: say both.
  const handleConfirm = async () => {
    try {
      await deleteTeam.mutateAsync(team.id);
    } catch {
      return;
    }

    if (isPermanent) {
      try {
        await deleteTeamPermanently.mutateAsync(team.id);
      } catch (err) {
        toast.error(
          t('teams.delete.permanentFailed', {
            name: team.name,
            reason: getTeamErrorMessage(err, 'deletePermanently'),
          }),
        );
        onDeleted();

        return;
      }
    }

    toast.success(t('teams.delete.success', { name: team.name }));
    onDeleted();
  };

  return (
    <ConfirmDrawer
      title={t('teams.delete.title', { name: team.name })}
      description={t('teams.delete.description', { code: team.team_code })}
      confirmLabel={t('teams.delete.submit')}
      isPending={isPending}
      errorMessage={deleteTeam.isError ? messageFor(deleteTeam.error) : undefined}
      onClose={onClose}
      onConfirm={() => {
        void handleConfirm();
      }}
    >
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">{t('teams.delete.impactTitle')}</p>
        <ul className="ml-4 list-disc text-muted-foreground">
          <li>{t('teams.delete.impactHidden')}</li>
          <li>{t('teams.delete.impactPlayers')}</li>
          <li>{t('teams.delete.impactFixtures')}</li>
        </ul>
      </div>
      <Field orientation="horizontal">
        <Checkbox
          id={permanentId}
          checked={isPermanent}
          disabled={isPending}
          onCheckedChange={(checked) => {
            setIsPermanent(checked === true);
          }}
        />
        <FieldContent>
          <FieldLabel htmlFor={permanentId}>{t('teams.delete.permanent')}</FieldLabel>
          <FieldDescription>{t('teams.delete.permanentHint')}</FieldDescription>
        </FieldContent>
      </Field>
    </ConfirmDrawer>
  );
};
