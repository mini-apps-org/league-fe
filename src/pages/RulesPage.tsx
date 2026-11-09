import { useTranslation } from 'react-i18next';

import { LegalPageLayout } from '@/components/auth/LegalPageLayout';

export function RulesPage() {
  const { t } = useTranslation();

  return <LegalPageLayout title={t('rules.title')} body={t('rules.body')} />;
}
