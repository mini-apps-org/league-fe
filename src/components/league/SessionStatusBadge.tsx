import { useTranslation } from 'react-i18next';

import { StatusDotBadge } from '@/components/league/StatusDotBadge';
import type { StatusTone } from '@/lib/status-colors';
import type { SessionStatus } from '@/types/league';

const STATUS_TONE: Record<SessionStatus, StatusTone> = {
  DRAFT: 'neutral',
  IN_PROGRESS: 'progress',
  COMPLETE: 'done',
  CANCELLED: 'danger',
};

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export const SessionStatusBadge = ({ status }: SessionStatusBadgeProps) => {
  const { t } = useTranslation();

  return (
    <StatusDotBadge tone={STATUS_TONE[status]}>
      {t(`admin.sessions.status.${status}`)}
    </StatusDotBadge>
  );
};
