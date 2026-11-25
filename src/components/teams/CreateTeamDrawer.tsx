import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { TeamCodeRules } from '@/components/teams/TeamCodeRules';
import { TeamTextField } from '@/components/teams/TeamTextField';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useCreateTeam } from '@/hooks/useTeamMutations';
import { isConflictError } from '@/lib/errors';
import { LoaderCircle } from '@/lib/icons';
import { getTeamErrorMessage } from '@/lib/team-errors';
import { createTeamSchema, type CreateTeamValues } from '@/lib/team-schema';

const FORM_ID = 'create-team-form';

interface CreateTeamDrawerProps {
  // The list's division filter, so a team created while filtering lands in that division.
  defaultDivisionId: string;
  onClose: () => void;
}

export const CreateTeamDrawer = ({ defaultDivisionId, onClose }: CreateTeamDrawerProps) => {
  const { t } = useTranslation();
  const createTeam = useCreateTeam();
  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { division_id: defaultDivisionId, venue_id: '', team_code: '', name: '' },
  });
  const teamCode = useWatch({ control: form.control, name: 'team_code' });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const team = await createTeam.mutateAsync({
        division_id: values.division_id,
        team_code: values.team_code,
        name: values.name,
        venue_id: values.venue_id === '' ? undefined : values.venue_id,
      });
      toast.success(t('teams.create.success', { name: team.name }));
      onClose();
    } catch (err) {
      // The only conflict on create is the code: point at the field as well as the banner.
      if (isConflictError(err)) {
        form.setError('team_code', { message: 'duplicateCode' });
      }
    }
  });

  return (
    <ResponsiveDrawer
      title={t('teams.create.title')}
      description={t('teams.create.description')}
      isBusy={createTeam.isPending}
      footer={
        <>
          <Button variant="outline" disabled={createTeam.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={createTeam.isPending}>
            {createTeam.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {t('teams.create.submit')}
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
        {createTeam.isError && (
          <Alert variant="destructive">
            <AlertTitle>{t('teams.create.failed')}</AlertTitle>
            <AlertDescription>{getTeamErrorMessage(createTeam.error, 'create')}</AlertDescription>
          </Alert>
        )}
        <FieldGroup>
          <TeamTextField
            control={form.control}
            name="division_id"
            label={t('teams.form.divisionId')}
            description={t('teams.form.divisionIdHint')}
            isRequired
            isMono
          />
          <TeamTextField
            control={form.control}
            name="venue_id"
            label={t('teams.form.venueId')}
            description={t('teams.form.venueIdHint')}
            isMono
          />
          <TeamTextField
            control={form.control}
            name="team_code"
            label={t('teams.form.teamCode')}
            description={t('teams.form.teamCodeHint')}
            placeholder={t('teams.form.teamCodePlaceholder')}
            isRequired
            isMono
            labelAddon={<TeamCodeRules teamCode={teamCode} />}
          />
          <TeamTextField
            control={form.control}
            name="name"
            label={t('teams.form.name')}
            placeholder={t('teams.form.namePlaceholder')}
            isRequired
          />
        </FieldGroup>
        <p className="text-sm text-muted-foreground">{t('teams.create.captainLater')}</p>
      </form>
    </ResponsiveDrawer>
  );
};
