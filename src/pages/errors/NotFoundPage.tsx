import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { StatusScreen } from '@/components/StatusScreen';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <StatusScreen
      mark="404"
      title={t('notFound.title')}
      body={t('notFound.body')}
      action={
        <Button asChild className="h-14 px-8 text-base">
          <Link to={ROUTES.HOME}>{t('notFound.backHome')}</Link>
        </Button>
      }
    />
  );
};
