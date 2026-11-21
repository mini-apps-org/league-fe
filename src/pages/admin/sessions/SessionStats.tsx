import { cn } from 'cn';
import { useTranslation } from 'react-i18next';

import type { LeagueSession } from '@/types/league';

interface StatCardProps {
  label: string;
  value: string | number;
  isHighlighted?: boolean;
}

const StatCard = ({ label, value, isHighlighted = false }: StatCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col rounded-card border bg-card px-4 py-3.5',
        isHighlighted && 'col-span-2 border-primary bg-primary-soft md:col-span-1',
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          'truncate font-semibold',
          isHighlighted ? 'mt-1.5 text-base text-primary' : 'tabular mt-0.5 text-[22px]',
        )}
      >
        {value}
      </span>
    </div>
  );
};

interface SessionStatsProps {
  sessions: LeagueSession[];
}

export const SessionStats = ({ sessions }: SessionStatsProps) => {
  const { t } = useTranslation();
  const activeSession = sessions.find((session) => session.isActive);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label={t('admin.sessions.stats.active')}
        value={activeSession?.name ?? t('admin.sessions.stats.noneActive')}
        isHighlighted
      />
      <StatCard label={t('admin.sessions.stats.total')} value={sessions.length} />
      <StatCard
        label={t('admin.sessions.stats.inProgress')}
        value={sessions.filter((session) => session.status === 'IN_PROGRESS').length}
      />
      <StatCard
        label={t('admin.sessions.stats.drafts')}
        value={sessions.filter((session) => session.status === 'DRAFT').length}
      />
    </div>
  );
};
