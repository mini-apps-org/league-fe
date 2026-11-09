import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Button } from '@/components/ui/button';

export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error(error);
  }

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-lg font-semibold">
        {isNotFound ? t('notFound.title') : t('routeError.title')}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t('routeError.body')}</p>
      <Button
        variant="outline"
        className="h-11"
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('routeError.reload')}
      </Button>
    </main>
  );
}
