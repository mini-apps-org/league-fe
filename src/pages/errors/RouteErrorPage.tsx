import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { StatusScreen } from '@/components/StatusScreen';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils';

export const RouteErrorPage = () => {
  const { t } = useTranslation();
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <StatusScreen
        mark="404"
        title={t('notFound.title')}
        body={t('notFound.body')}
        action={
          <Button asChild size="lg">
            <Link to={ROUTES.HOME}>{t('notFound.backHome')}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <StatusScreen
      mark="!"
      title={t('routeError.title')}
      body={t('routeError.body')}
      action={
        <Button
          className="h-14 px-8 text-base"
          onClick={() => {
            window.location.reload();
          }}
        >
          {t('routeError.reload')}
        </Button>
      }
    />
  );
};
