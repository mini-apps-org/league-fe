import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { TeamCodeRules } from '@/components/teams/TeamCodeRules';
import { TeamTextField } from '@/components/teams/TeamTextField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTeam } from '@/hooks/useTeamMutations';
import { isConflictError } from '@/lib/errors';
import { LoaderCircle } from '@/lib/icons';
import { getTeamErrorMessage } from '@/lib/team-errors';
import { editTeamSchema, type EditTeamValues } from '@/lib/team-schema';
import type { RosterPlayer, Team, UpdateTeamInput } from '@/types/teams';

const FORM_ID = 'edit-team-form';
const CAPTAIN_FIELD_ID = 'edit-team-captain';

interface EditTeamDrawerProps {
  team: Team;
  // The loaded roster of the division on screen: a captain must be on an active roster.
  captainCandidates: RosterPlayer[];
  onClose: () => void;
}

// league-be's PATCH is partial and rejects an empty one, so only changed fields are sent. An
// absent field means "unchanged", so a captain or venue can be replaced but not cleared.
const getChangedFields = (team: Team, values: EditTeamValues): UpdateTeamInput => {
  const changes: UpdateTeamInput = {};

  if (values.team_code.toUpperCase() !== team.team_code) {
    changes.team_code = values.team_code;
  }
  if (values.name !== team.name) {
    changes.name = values.name;
  }
  if (values.captain_player_id !== '' && values.captain_player_id !== team.captain_player_id) {
    changes.captain_player_id = values.captain_player_id;
  }
  if (values.venue_id !== '' && values.venue_id !== team.venue_id) {
    changes.venue_id = values.venue_id;
  }

  return changes;
};

export const EditTeamDrawer = ({ team, captainCandidates, onClose }: EditTeamDrawerProps) => {
  const { t } = useTranslation();
  const updateTeam = useUpdateTeam();
  const form = useForm<EditTeamValues>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      team_code: team.team_code,
      name: team.name,
      captain_player_id: team.captain_player_id ?? '',
      venue_id: team.venue_id ?? '',
    },
  });
  const teamCode = useWatch({ control: form.control, name: 'team_code' });

  const handleSubmit = form.handleSubmit(async (values) => {
    const changes = getChangedFields(team, values);

    if (Object.keys(changes).length === 0) {
      onClose();

      return;
    }

    try {
      await updateTeam.mutateAsync({ teamId: team.id, input: changes });
      toast.success(t('teams.edit.success', { name: values.name }));
      onClose();
    } catch (err) {
      // The only conflict on update is the code.
      if (isConflictError(err)) {
        form.setError('team_code', { message: 'duplicateCode' });
      }
    }
  });

  return (
    <ResponsiveDrawer
      title={t('teams.edit.title')}
      description={t('teams.edit.description')}
      isBusy={updateTeam.isPending}
      footer={
        <>
          <Button variant="outline" disabled={updateTeam.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={updateTeam.isPending}>
            {updateTeam.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {t('teams.edit.submit')}
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
        {updateTeam.isError && (
          <Alert variant="destructive">
            <AlertDescription>{getTeamErrorMessage(updateTeam.error, 'update')}</AlertDescription>
          </Alert>
        )}
        <FieldGroup>
          <TeamTextField
            control={form.control}
            name="team_code"
            label={t('teams.form.teamCode')}
            description={t('teams.form.teamCodeHint')}
            isRequired
            isMono
            labelAddon={<TeamCodeRules teamCode={teamCode} />}
          />
          <TeamTextField
            control={form.control}
            name="name"
            label={t('teams.form.name')}
            isRequired
          />
          <Controller
            control={form.control}
            name="captain_player_id"
            render={({ field }) => {
              return (
                <Field>
                  <FieldLabel htmlFor={CAPTAIN_FIELD_ID}>{t('teams.form.captain')}</FieldLabel>
                  <Select
                    value={field.value}
                    disabled={captainCandidates.length === 0}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={CAPTAIN_FIELD_ID} className="w-full">
                      <SelectValue placeholder={t('teams.form.captainPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {captainCandidates.map((player) => (
                        <SelectItem key={player.player_id} value={player.player_id}>
                          {`${player.full_name} · ${player.member_id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {captainCandidates.length === 0
                      ? t('teams.form.captainNoRoster')
                      : t('teams.form.captainHint')}
                  </FieldDescription>
                </Field>
              );
            }}
          />
          <TeamTextField
            control={form.control}
            name="venue_id"
            label={t('teams.form.venueId')}
            description={t('teams.form.venueIdEditHint')}
            isMono
          />
        </FieldGroup>
      </form>
    </ResponsiveDrawer>
  );
};
