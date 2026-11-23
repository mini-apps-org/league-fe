import { cn } from 'cn';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { STATUS_TONE_STYLE, type StatusTone } from '@/lib/status-colors';

interface StatusDotBadgeProps {
  tone: StatusTone;
  children: ReactNode;
}

export const StatusDotBadge = ({ tone, children }: StatusDotBadgeProps) => {
  const style = STATUS_TONE_STYLE[tone];

  return (
    <Badge variant={style.variant} className={style.className}>
      <span aria-hidden className={cn('size-1.5 rounded-full', style.dotClassName)} />
      {children}
    </Badge>
  );
};
