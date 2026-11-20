import { useTranslation } from 'react-i18next';

import { LegalPageLayout } from '@/components/auth/LegalPageLayout';

export function PrivacyPage() {
  const { t } = useTranslation();

  return <LegalPageLayout title={t('privacy.title')} body={t('privacy.body')} />;
}
