import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { TeamTextField } from '@/components/teams/TeamTextField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAddRosterPlayer } from '@/hooks/useTeamMutations';
import { LoaderCircle } from '@/lib/icons';
import { getTeamErrorMessage } from '@/lib/team-errors';
import { playerIdSchema, type PlayerIdValues } from '@/lib/team-schema';
import type { Team } from '@/types/teams';

const FORM_ID = 'add-player-form';

interface AddPlayerDrawerProps {
  team: Team;
  divisionId: string;
  onClose: () => void;
}

// league-be has no player search yet, so the player is given by id. A player already on an
// active roster in this division comes back as a 409.
export const AddPlayerDrawer = ({ team, divisionId, onClose }: AddPlayerDrawerProps) => {
  const { t } = useTranslation();
  const addPlayer = useAddRosterPlayer();
  const form = useForm<PlayerIdValues>({
    resolver: zodResolver(playerIdSchema),
    defaultValues: { player_id: '' },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const player = await addPlayer.mutateAsync({
        teamId: team.id,
        divisionId,
        playerId: values.player_id,
      });
      toast.success(t('teams.addPlayer.success', { name: player.full_name, team: team.name }));
      onClose();
    } catch {
      // Shown in the drawer's banner.
    }
  });

  return (
    <ResponsiveDrawer
      title={t('teams.addPlayer.title')}
      description={t('teams.addPlayer.description', { team: team.name })}
      isBusy={addPlayer.isPending}
      footer={
        <>
          <Button variant="outline" disabled={addPlayer.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={addPlayer.isPending}>
            {addPlayer.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {t('teams.addPlayer.submit')}
          </Button>
        </>
      }
      onClose={onClose}
    >
      <form
        id={FORM_ID}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        {addPlayer.isError && (
          <Alert variant="destructive">
            <AlertDescription>{getTeamErrorMessage(addPlayer.error, 'addPlayer')}</AlertDescription>
          </Alert>
        )}
        <TeamTextField
          control={form.control}
          name="player_id"
          label={t('teams.addPlayer.playerId')}
          description={t('teams.addPlayer.playerIdHint')}
          isRequired
        />
      </form>
    </ResponsiveDrawer>
  );
};
