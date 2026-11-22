import type { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  description?: ReactNode;
}

export const PageTitle = ({ children, description }: PageTitleProps) => {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      {description !== undefined && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
