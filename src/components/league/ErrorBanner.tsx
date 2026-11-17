import { useTranslation } from 'react-i18next';

import { Alert, AlertAction, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { messageFor } from '@/lib/errors';
import { TriangleAlert } from '@/lib/icons';

interface ErrorBannerProps {
  error: unknown;
  onRetry?: () => void;
}

// messageFor() maps the 5-digit code through i18n. The backend's own `message` is never
// rendered: it is written for us, not for a player in a pool hall.
export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="warn">
      <TriangleAlert aria-hidden />
      <AlertDescription>{messageFor(error)}</AlertDescription>
      {onRetry !== undefined && (
        <AlertAction>
          <Button variant="outline" className="h-11 px-4 font-semibold" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
