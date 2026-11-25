import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ResponsiveDrawer } from '@/components/league/ResponsiveDrawer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from '@/lib/icons';

interface ConfirmDrawerProps {
  title: string;
  description?: string;
  confirmLabel: string;
  isPending: boolean;
  // Already translated; shown above the actions so the user can retry or cancel.
  errorMessage?: string;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDrawer = ({
  title,
  description,
  confirmLabel,
  isPending,
  errorMessage,
  children,
  onConfirm,
  onClose,
}: ConfirmDrawerProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveDrawer
      title={title}
      description={description}
      isBusy={isPending}
      footer={
        <>
          <Button variant="outline" disabled={isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </>
      }
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {children}
        {errorMessage !== undefined && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </ResponsiveDrawer>
  );
};
