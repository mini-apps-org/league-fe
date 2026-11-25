import { useTranslation } from 'react-i18next';

import { PageTitle } from '@/components/PageTitle';

export const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <PageTitle>{t('dashboard.title')}</PageTitle>
      <p className="text-muted-foreground">{t('common.comingSoon')}</p>
    </div>
  );
};
