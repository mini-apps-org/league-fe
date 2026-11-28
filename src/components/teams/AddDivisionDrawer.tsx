import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { TeamLookupField } from '@/components/teams/TeamLookupField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAddTeamDivision } from '@/hooks/useTeamMutations';
import { LoaderCircle } from '@/lib/icons';
import { getTeamErrorMessage } from '@/lib/team-errors';
import { divisionIdSchema, type DivisionIdValues } from '@/lib/team-schema';
import type { Team } from '@/types/teams';

const FORM_ID = 'add-division-form';

interface AddDivisionDrawerProps {
  team: Team;
  onClose: () => void;
  onAdded: (divisionId: string) => void;
}

export const AddDivisionDrawer = ({ team, onClose, onAdded }: AddDivisionDrawerProps) => {
  const { t } = useTranslation();
  const addDivision = useAddTeamDivision();
  const form = useForm<DivisionIdValues>({
    resolver: zodResolver(divisionIdSchema),
    defaultValues: { division_id: '' },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const entry = await addDivision.mutateAsync({
        teamId: team.id,
        divisionId: values.division_id,
      });
      toast.success(t('teams.addDivision.success', { team: team.name }));
      onAdded(entry.division_id);
    } catch {
      // Shown in the drawer's banner.
    }
  });

  return (
    <ResponsiveDrawer
      title={t('teams.addDivision.title')}
      description={t('teams.addDivision.description', { team: team.name })}
      isBusy={addDivision.isPending}
      footer={
        <>
          <Button variant="outline" disabled={addDivision.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={addDivision.isPending}>
            {addDivision.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {t('teams.addDivision.submit')}
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
        {addDivision.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getTeamErrorMessage(addDivision.error, 'addDivision')}
            </AlertDescription>
          </Alert>
        )}
        <TeamLookupField
          control={form.control}
          name="division_id"
          lookup="division"
          label={t('teams.lookup.division')}
          isRequired
        />
        <p className="text-sm text-muted-foreground">{t('teams.addDivision.note')}</p>
      </form>
    </ResponsiveDrawer>
  );
};
