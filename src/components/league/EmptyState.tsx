import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  body?: string;
  // Only where the user can actually act. An empty state with no available action gets none.
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-input-line px-6 py-8 text-center">
      <span className="mb-2 flex size-14 items-center justify-center rounded-card bg-sunken text-muted-foreground">
        <Icon className="size-6.5" aria-hidden />
      </span>
      <p className="text-[17px] font-semibold">{title}</p>
      {body !== undefined && <p className="text-muted-foreground">{body}</p>}
      {action !== undefined && <div className="pt-2">{action}</div>}
    </div>
  );
}
