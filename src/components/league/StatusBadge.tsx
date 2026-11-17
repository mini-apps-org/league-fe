import type { VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { TeamMatchStatus } from '@/types/league';

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

const STATUS_TONE: Record<TeamMatchStatus, BadgeTone> = {
  scheduled: 'neutral',
  in_progress: 'info',
  submitted: 'ok',
};

interface StatusBadgeProps {
  status: TeamMatchStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return <Badge tone={STATUS_TONE[status]}>{t(`matchStatus.${status}`)}</Badge>;
}
