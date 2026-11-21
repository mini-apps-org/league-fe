import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DrawerClose, DrawerFooter } from '@/components/ui/drawer';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useDeleteSession } from '@/hooks/useSessionMutations';
import { LoaderCircle, TriangleAlert } from '@/lib/icons';
import type { LeagueSession } from '@/types/league';

import { ResponsiveDrawer } from './ResponsiveDrawer';
import { ServerErrorAlert } from './ServerErrorAlert';

interface DeleteConfirmValues {
  confirmName: string;
}

interface DeleteSessionBodyProps {
  session: LeagueSession;
  onDone: () => void;
}

// Mounted inside the drawer's content, so the typed name and any error reset on every open.
const DeleteSessionBody = ({ session, onDone }: DeleteSessionBodyProps) => {
  const { t } = useTranslation();
  const deleteSession = useDeleteSession();
  const form = useForm<DeleteConfirmValues>({ defaultValues: { confirmName: '' } });
  const confirmName = useWatch({ control: form.control, name: 'confirmName' });
  const isConfirmed = confirmName === session.name;

  const handleDelete = (): void => {
    if (!isConfirmed) {
      return;
    }

    deleteSession.mutate(session.id, {
      onSuccess: () => {
        toast.success(t('admin.sessions.toast.deleted', { name: session.name }));
        onDone();
      },
    });
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(handleDelete)(event);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
        {deleteSession.error !== null && (
          <ServerErrorAlert
            title={t('admin.sessions.deleteConfirm.failed')}
            error={deleteSession.error}
          />
        )}

        {session.hasSubmittedResults && (
          <Alert className="border-highlight/55 bg-highlight-soft">
            <TriangleAlert className="text-highlight-foreground" aria-hidden />
            <AlertTitle>{t('admin.sessions.deleteConfirm.submittedTitle')}</AlertTitle>
            <AlertDescription>
              {t('admin.sessions.deleteConfirm.submittedBody', { name: session.name })}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1 rounded-lg bg-muted p-3.5">
          <p className="font-semibold">{t('admin.sessions.deleteConfirm.cascadeTitle')}</p>
          <ul className="tabular list-disc pl-4.5 text-muted-foreground">
            <li>{t('admin.sessions.deleteConfirm.cascadeTeams')}</li>
            <li>{t('admin.sessions.deleteConfirm.cascadeWeeks', { count: session.weekCount })}</li>
            <li>{t('admin.sessions.deleteConfirm.cascadeResults')}</li>
          </ul>
        </div>

        <Controller
          name="confirmName"
          control={form.control}
          render={({ field }) => {
            return (
              <Field>
                <FieldLabel htmlFor="delete-session-confirm">
                  {t('admin.sessions.deleteConfirm.confirmLabel', { name: session.name })}
                </FieldLabel>
                <Input {...field} id="delete-session-confirm" autoComplete="off" />
              </Field>
            );
          }}
        />
      </div>

      <DrawerFooter className="flex-row justify-end border-t">
        <DrawerClose asChild>
          <Button type="button" variant="outline" disabled={deleteSession.isPending}>
            {t('common.cancel')}
          </Button>
        </DrawerClose>
        <Button
          type="submit"
          variant="destructive"
          disabled={!isConfirmed || deleteSession.isPending}
        >
          {deleteSession.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
          {deleteSession.isPending
            ? t('admin.sessions.deleteConfirm.deleting')
            : t('admin.sessions.deleteConfirm.confirm')}
        </Button>
      </DrawerFooter>
    </form>
  );
};

interface DeleteSessionDrawerProps {
  open: boolean;
  // Kept after close, so the title doesn't empty while the drawer animates out.
  session: LeagueSession | null;
  onOpenChange: (open: boolean) => void;
}

export const DeleteSessionDrawer = ({ open, session, onOpenChange }: DeleteSessionDrawerProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('admin.sessions.deleteConfirm.title', { name: session?.name ?? '' })}
      description={t('admin.sessions.deleteConfirm.subtitle')}
    >
      {session && (
        <DeleteSessionBody
          session={session}
          onDone={() => {
            onOpenChange(false);
          }}
        />
      )}
    </ResponsiveDrawer>
  );
};
