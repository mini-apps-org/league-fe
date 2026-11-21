// Badges stay stock shadcn; a status only picks the badge variant and its colours, from the
// Sessions Redesign: draft outlined, in progress yellow, complete teal, cancelled red.
export type StatusTone = 'neutral' | 'progress' | 'done' | 'danger';

export interface StatusToneStyle {
  variant: 'outline' | 'secondary';
  className: string;
  dotClassName: string;
}

export const STATUS_TONE_STYLE: Record<StatusTone, StatusToneStyle> = {
  neutral: {
    variant: 'outline',
    className: 'border-input text-muted-foreground',
    dotClassName: 'bg-current',
  },
  progress: {
    variant: 'secondary',
    className: 'bg-highlight-soft text-highlight-foreground',
    dotClassName: 'bg-highlight ring-3 ring-highlight/25',
  },
  done: {
    variant: 'secondary',
    className: 'bg-primary-soft text-primary',
    dotClassName: 'bg-current',
  },
  danger: {
    variant: 'secondary',
    className: 'bg-destructive-soft text-destructive',
    dotClassName: 'bg-current',
  },
};
