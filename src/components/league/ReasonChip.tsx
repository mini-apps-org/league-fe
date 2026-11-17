import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import type { PutUpBlockReason } from '@/types/league';

type ReasonChipProps = { reason: PutUpBlockReason } | { reason: 'unpaid' };

export function ReasonChip({ reason }: ReasonChipProps) {
  const { t } = useTranslation();

  if (reason === 'unpaid') {
    return <Badge tone="warn">{t('roster.unpaid')}</Badge>;
  }

  return <Badge tone="neutral">{t(`putUp.reason.${reason}`)}</Badge>;
}
