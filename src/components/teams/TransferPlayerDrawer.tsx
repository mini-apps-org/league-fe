import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { TeamFieldError } from '@/components/teams/TeamFieldError';
import { TeamTextField } from '@/components/teams/TeamTextField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransferRosterPlayer } from '@/hooks/useTeamMutations';
import { useTeams } from '@/hooks/useTeams';
import { LoaderCircle } from '@/lib/icons';
import { getTeamErrorMessage } from '@/lib/team-errors';
import { transferSchema, type TransferValues } from '@/lib/team-schema';
import type { RosterPlayer, Team } from '@/types/teams';

const FORM_ID = 'transfer-player-form';
const TEAM_FIELD_ID = 'transfer-target-team';
// league-be's MaxLimit is 200; one page of a division's teams is enough for the picker.
const TARGET_TEAMS_LIMIT = 100;

interface TransferPlayerDrawerProps {
  team: Team;
  divisionId: string;
  player: RosterPlayer;
  onClose: () => void;
}

export const TransferPlayerDrawer = ({
  team,
  divisionId,
  player,
  onClose,
}: TransferPlayerDrawerProps) => {
  const { t } = useTranslation();
  const transfer = useTransferRosterPlayer();
  const teamsQuery = useTeams({ division_id: divisionId, sort: 'name', limit: TARGET_TEAMS_LIMIT });
  const targetTeams = (teamsQuery.data?.pages[0]?.data ?? []).filter(
    (candidate) => candidate.id !== team.id,
  );
  const form = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { team_id: '', division_id: '' },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await transfer.mutateAsync({
        ref: { teamId: team.id, divisionId, playerId: player.player_id },
        input: {
          team_id: values.team_id,
          division_id: values.division_id === '' ? undefined : values.division_id,
        },
      });
      toast.success(t('teams.transfer.success', { name: player.full_name }));
      onClose();
    } catch {
      // Shown in the drawer's banner.
    }
  });

  return (
    <ResponsiveDrawer
      title={t('teams.transfer.title')}
      description={t('teams.transfer.description', { name: player.full_name })}
      isBusy={transfer.isPending}
      footer={
        <>
          <Button variant="outline" disabled={transfer.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={transfer.isPending}>
            {transfer.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {t('teams.transfer.submit')}
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
        {transfer.isError && (
          <Alert variant="destructive">
            <AlertDescription>{getTeamErrorMessage(transfer.error, 'transfer')}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm">
          {t('teams.transfer.playerSummary', {
            name: player.full_name,
            skill: player.skill_level,
            played: player.matches_played,
            team: team.name,
          })}
        </p>
        <FieldGroup>
          <Controller
            control={form.control}
            name="team_id"
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={TEAM_FIELD_ID}>
                    {t('teams.transfer.targetTeam')}
                    <span aria-hidden>{' *'}</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    disabled={teamsQuery.isPending}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={TEAM_FIELD_ID}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder={t('teams.transfer.targetTeamPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {targetTeams.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {`${candidate.name} · ${candidate.team_code}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TeamFieldError error={fieldState.error} />
                </Field>
              );
            }}
          />
          <TeamTextField
            control={form.control}
            name="division_id"
            label={t('teams.transfer.division')}
            description={t('teams.transfer.divisionHint')}
            isMono
          />
        </FieldGroup>
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">{t('teams.transfer.impactTitle')}</p>
          <ul className="ml-4 list-disc text-muted-foreground">
            <li>{t('teams.transfer.impactLeaves', { name: player.full_name, team: team.name })}</li>
            <li>{t('teams.transfer.impactStats', { team: team.name })}</li>
            <li>{t('teams.transfer.impactFresh')}</li>
          </ul>
        </div>
      </form>
    </ResponsiveDrawer>
  );
};
