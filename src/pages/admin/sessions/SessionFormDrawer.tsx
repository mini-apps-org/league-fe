import { useTranslation } from 'react-i18next';

import type { LeagueSession } from '@/types/league';

import { ResponsiveDrawer } from './ResponsiveDrawer';
import { SessionForm } from './SessionForm';

interface SessionFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Absent when creating.
  session?: LeagueSession;
}

export const SessionFormDrawer = ({ open, onOpenChange, session }: SessionFormDrawerProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={session ? t('admin.sessions.form.editTitle') : t('admin.sessions.form.createTitle')}
      description={
        session
          ? t('admin.sessions.form.editDescription')
          : t('admin.sessions.form.createDescription')
      }
    >
      <SessionForm
        session={session}
        onDone={() => {
          onOpenChange(false);
        }}
      />
    </ResponsiveDrawer>
  );
};
