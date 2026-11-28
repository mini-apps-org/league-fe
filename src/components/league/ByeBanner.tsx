import { useTranslation } from 'react-i18next';

import type { TeamOption } from '@/types/league';

interface ByeBannerProps {
  team: TeamOption;
}

export function ByeBanner({ team }: ByeBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-12 items-center justify-between gap-2 rounded-lg bg-sunken px-4 text-sm font-medium text-text-2">
      <span className="truncate">
        <span className="tabular">{team.teamNumber}</span> {team.name}
      </span>
      <span className="text-muted-foreground">{t('night.bye')}</span>
    </div>
  );
}
