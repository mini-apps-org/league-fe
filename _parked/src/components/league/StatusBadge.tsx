import { useTranslation } from 'react-i18next';

import { cn } from 'cn';
import type { TeamMatchStatus } from '@/types/league';

// The palette has accent-soft but no soft ok/warn, so those two tints are derived with
// color-mix against --card. That is the only permitted derivation; never a new hex.
const STATUS_CLASS: Record<TeamMatchStatus, string> = {
  scheduled: 'bg-chip text-text-2',
  in_progress: 'bg-accent text-accent-foreground',
  submitted: 'bg-[color-mix(in_oklab,var(--ok)_12%,var(--card))] text-ok',
};

export default function StatusBadge({ status }: { status: TeamMatchStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-chip px-2 text-xs font-medium',
        STATUS_CLASS[status],
      )}
    >
      {t(`matchStatus.${status}`)}
    </span>
  );
}
