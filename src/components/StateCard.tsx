import { cn } from 'cn';
import type { ComponentType, ReactNode } from 'react';

export type StateCardTone = 'neutral' | 'highlight' | 'destructive';

const ICON_TILE_CLASS: Record<StateCardTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  highlight: 'bg-highlight-soft text-highlight-foreground',
  destructive: 'bg-destructive-soft text-destructive',
};

interface StateCardProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  tone?: StateCardTone;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  // Off when the state sits inside a card that already has the border.
  bordered?: boolean;
}

// The design's empty, error and no-access state: icon tile, title, body, one action.
export const StateCard = ({
  icon: Icon,
  tone = 'neutral',
  title,
  body,
  action,
  bordered = true,
}: StateCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 px-6 py-14 text-center',
        bordered && 'rounded-card border bg-card',
      )}
    >
      <span
        className={cn(
          'mb-2 flex size-12 items-center justify-center rounded-xl',
          ICON_TILE_CLASS[tone],
        )}
      >
        <Icon className="size-5.5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      {body !== undefined && <p className="max-w-95 text-muted-foreground">{body}</p>}
      {action !== undefined && <div className="pt-2.5">{action}</div>}
    </div>
  );
};
