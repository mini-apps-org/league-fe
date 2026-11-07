import { useTranslation } from 'react-i18next';

import { cn } from 'cn';

// The 8-ball. No image asset, so it scales and themes for free.
export default function AppMark({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      role="img"
      aria-label={t('app.name')}
      className={cn(
        'inline-flex size-22 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground',
        className,
      )}
    >
      8
    </span>
  );
}
