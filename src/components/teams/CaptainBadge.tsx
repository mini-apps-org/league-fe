import { useTranslation } from 'react-i18next';

import { StatusDotBadge } from '@/components/league/StatusDotBadge';

interface CaptainBadgeProps {
  hasCaptain: boolean;
}

export const CaptainBadge = ({ hasCaptain }: CaptainBadgeProps) => {
  const { t } = useTranslation();

  if (hasCaptain) {
    return <StatusDotBadge tone="done">{t('teams.captain.set')}</StatusDotBadge>;
  }

  return <StatusDotBadge tone="progress">{t('teams.captain.needed')}</StatusDotBadge>;
};
