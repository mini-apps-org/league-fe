import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { Pencil, Trash2, UserPlus } from '@/lib/icons';
import type { Team } from '@/types/teams';

interface TeamOverviewProps {
  team: Team;
  // From the roster on screen. Null when the captain isn't in it (or no division is chosen).
  captainName: string | null;
  // Active players in the chosen division; null until one is chosen and loaded.
  activePlayers: number | null;
  // Each is undefined when the user lacks its permission; Add player also needs a division.
  onEdit?: () => void;
  onDelete?: () => void;
  onAddPlayer?: () => void;
}

interface SummaryCardProps {
  label: string;
  value: string;
  detail: string;
}

const SummaryCard = ({ label, value, detail }: SummaryCardProps) => {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-line bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </div>
  );
};

export const TeamOverview = ({
  team,
  captainName,
  activePlayers,
  onEdit,
  onDelete,
  onAddPlayer,
}: TeamOverviewProps) => {
  const { t } = useTranslation();
  const hasCaptain = team.captain_player_id !== null;

  const getCaptainValue = (): string => {
    if (!hasCaptain) {
      return t('teams.captain.needed');
    }

    return captainName ?? t('teams.captain.set');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
            {team.name}
            <span className="tabular rounded-chip bg-sunken px-2 py-0.5 font-mono text-sm font-medium">
              {team.team_code}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('teams.detail.updated', { date: formatDate(team.updated_at) })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onDelete !== undefined && (
            <Button variant="outline" onClick={onDelete}>
              <Trash2 aria-hidden />
              {t('teams.delete.submit')}
            </Button>
          )}
          {onEdit !== undefined && (
            <Button variant="outline" onClick={onEdit}>
              <Pencil aria-hidden />
              {t('teams.edit.open')}
            </Button>
          )}
          {onAddPlayer !== undefined && (
            <Button onClick={onAddPlayer}>
              <UserPlus aria-hidden />
              {t('teams.addPlayer.title')}
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label={t('teams.detail.captain')}
          value={getCaptainValue()}
          detail={hasCaptain ? t('teams.detail.captainDetail') : t('teams.detail.captainMissing')}
        />
        <SummaryCard
          label={t('teams.detail.activePlayers')}
          value={activePlayers === null ? '—' : String(activePlayers)}
          detail={t('teams.detail.activePlayersDetail')}
        />
        <SummaryCard
          label={t('teams.detail.created')}
          value={formatDate(team.created_at)}
          detail={t('teams.detail.createdDetail')}
        />
      </div>
    </div>
  );
};
