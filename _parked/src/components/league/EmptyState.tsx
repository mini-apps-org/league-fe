import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  body?: string;
  // Only where the user can actually act. An empty state with no available action gets none.
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-lg font-semibold">{title}</p>
      {body !== undefined && <p className="text-sm text-muted-foreground">{body}</p>}
      {action !== undefined && <div className="pt-2">{action}</div>}
    </div>
  );
}
