import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { HeaderMark } from '@/components/HeaderMark';
import { ThemeToggle } from '@/components/ThemeToggle';

interface StatusScreenProps {
  mark: string;
  title: string;
  body: string;
  action: ReactNode;
}

export const StatusScreen = ({ mark, title, body, action }: StatusScreenProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-line bg-card pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center gap-2.5 pr-1.5 pl-4 lg:h-16 lg:px-6">
          <HeaderMark tone="ink" />
          <span className="flex-1 truncate text-[17px] font-semibold">{t('app.name')}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 pb-20 text-center">
        <span
          aria-hidden
          className="mb-2 text-[56px] leading-none font-bold text-muted-foreground tabular-nums"
        >
          {mark}
        </span>
        <h1 className="text-[22px] font-bold">{title}</h1>
        <p className="mb-4 max-w-sm text-muted-foreground">{body}</p>
        {action}
      </main>
    </div>
  );
};
