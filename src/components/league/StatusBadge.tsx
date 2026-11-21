import { useTranslation } from 'react-i18next';

import { StatusDotBadge } from '@/components/league/StatusDotBadge';
import type { StatusTone } from '@/lib/status-colors';
import type { TeamMatchStatus } from '@/types/league';

const STATUS_TONE: Record<TeamMatchStatus, StatusTone> = {
  scheduled: 'neutral',
  in_progress: 'progress',
  submitted: 'done',
};

interface StatusBadgeProps {
  status: TeamMatchStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return <StatusDotBadge tone={STATUS_TONE[status]}>{t(`matchStatus.${status}`)}</StatusDotBadge>;
}
