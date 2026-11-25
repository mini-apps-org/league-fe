import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DrawerClose, DrawerFooter } from '@/components/ui/drawer';
import { useSessions } from '@/hooks/useLeagueQueries';
import { useCreateSession, useUpdateSession } from '@/hooks/useSessionMutations';
import { isApiError } from '@/lib/errors';
import { LoaderCircle } from '@/lib/icons';
import { ALL_SESSIONS } from '@/lib/session-filters';
import {
  getSessionFormValues,
  getSessionPatch,
  isDuplicateSessionName,
  type SessionFormOutput,
  sessionFormSchema,
  type SessionFormValues,
} from '@/lib/session-form';
import { ERROR_CODE } from '@/types/errors';
import type { LeagueSession } from '@/types/league';

import { ServerErrorAlert } from './ServerErrorAlert';
import { SessionFormFields } from './SessionFormFields';

interface SessionFormProps {
  // Absent when creating.
  session?: LeagueSession;
  onDone: () => void;
}

// Mounted inside the drawer's content, which unmounts on close, so every open starts fresh.
export const SessionForm = ({ session, onDone }: SessionFormProps) => {
  const { t } = useTranslation();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const mutation = session ? updateSession : createSession;
  const { data: allSessions = [] } = useSessions(ALL_SESSIONS);
  const otherActiveSession = allSessions.find((candidate) => {
    return candidate.isActive && candidate.id !== session?.id;
  });
  const form = useForm<SessionFormValues, unknown, SessionFormOutput>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: getSessionFormValues(session),
  });

  const markDuplicateName = (): void => {
    form.setError('name', { type: 'validate', message: 'duplicateName' }, { shouldFocus: true });
  };

  const handleServerError = (error: unknown): void => {
    if (isApiError(error) && error.code === ERROR_CODE.CONFLICT) {
      markDuplicateName();
    }
  };

  const save = (input: SessionFormOutput): void => {
    if (isDuplicateSessionName(input.name, allSessions, session?.id)) {
      markDuplicateName();
      return;
    }

    if (!session) {
      createSession.mutate(input, {
        onSuccess: (created) => {
          toast.success(t('admin.sessions.toast.created', { name: created.name }));
          onDone();
        },
        onError: handleServerError,
      });
      return;
    }

    const patch = getSessionPatch(session, input);
    if (Object.keys(patch).length === 0) {
      onDone();
      return;
    }

    updateSession.mutate(
      { sessionId: session.id, patch },
      {
        onSuccess: (saved) => {
          toast.success(t('admin.sessions.toast.updated', { name: saved.name }));
          onDone();
        },
        onError: handleServerError,
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          void form.handleSubmit(save)(event);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
          {mutation.error !== null && (
            <ServerErrorAlert title={t('admin.sessions.form.saveFailed')} error={mutation.error} />
          )}
          <SessionFormFields otherActiveSessionName={otherActiveSession?.name} />
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button type="button" variant="outline" disabled={mutation.isPending}>
              {t('common.cancel')}
            </Button>
          </DrawerClose>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {mutation.isPending && t('admin.sessions.form.saving')}
            {!mutation.isPending &&
              (session ? t('admin.sessions.form.save') : t('admin.sessions.form.create'))}
          </Button>
        </DrawerFooter>
      </form>
    </FormProvider>
  );
};
