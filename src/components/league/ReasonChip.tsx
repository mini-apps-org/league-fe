import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { STATUS_TONE_STYLE } from '@/lib/status-colors';
import type { PutUpBlockReason } from '@/types/league';

type ReasonChipProps = { reason: PutUpBlockReason } | { reason: 'unpaid' };

export function ReasonChip({ reason }: ReasonChipProps) {
  const { t } = useTranslation();

  if (reason === 'unpaid') {
    return (
      <Badge variant="secondary" className={STATUS_TONE_STYLE.progress.className}>
        {t('roster.unpaid')}
      </Badge>
    );
  }

  return <Badge variant="secondary">{t(`putUp.reason.${reason}`)}</Badge>;
}
