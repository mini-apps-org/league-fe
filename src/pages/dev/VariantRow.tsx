import { cn } from 'cn';
import type { ReactNode } from 'react';

interface VariantRowProps {
  name: string;
  children: ReactNode;
  className?: string;
}

// The name is the prop value a caller passes, so it is shown as code, not translated.
export function VariantRow({ name, children, className }: VariantRowProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-line py-3 first:border-t-0 md:flex-row md:items-center md:gap-4">
      <code className="w-36 shrink-0 font-mono text-xs text-muted-foreground">{name}</code>
      <div className={cn('flex min-w-0 flex-1 flex-wrap items-center gap-3', className)}>
        {children}
      </div>
    </div>
  );
}
