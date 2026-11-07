import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { TriangleAlert } from '@/lib/icons';
import { messageFor } from '@/lib/errors';

interface ErrorBannerProps {
  error: unknown;
  onRetry?: () => void;
}

// messageFor() maps the 5-digit code through i18n. The backend's own `message` is never
// rendered: it is written for us, not for a player in a pool hall.
export default function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-warn bg-[color-mix(in_oklab,var(--warn)_12%,var(--card))] p-3"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
      <p className="flex-1 text-sm text-foreground">{messageFor(error)}</p>
      {onRetry !== undefined && (
        <Button variant="ghost" className="h-8 shrink-0 px-2 text-sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
