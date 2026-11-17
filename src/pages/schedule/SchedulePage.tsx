import { useTranslation } from 'react-i18next';

import { PageTitle } from '@/components/PageTitle';

export const SchedulePage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <PageTitle>{t('schedule.title')}</PageTitle>
      <p className="text-sm text-muted-foreground">{t('common.comingSoon')}</p>
    </div>
  );
};
