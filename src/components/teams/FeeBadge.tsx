import { useTranslation } from 'react-i18next';

import { StatusDotBadge } from '@/components/league/StatusDotBadge';

interface FeeBadgeProps {
  isPaid: boolean;
}

export const FeeBadge = ({ isPaid }: FeeBadgeProps) => {
  const { t } = useTranslation();

  return (
    <StatusDotBadge tone={isPaid ? 'done' : 'progress'}>
      {isPaid ? t('teams.roster.paid') : t('teams.roster.unpaid')}
    </StatusDotBadge>
  );
};
