import { useTranslation } from 'react-i18next';

import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import { FeeBadge } from '@/components/teams/FeeBadge';
import { PlayerActionsMenu } from '@/components/teams/PlayerActionsMenu';
import { PlayerAvatar } from '@/components/teams/PlayerAvatar';
import type { RosterListProps } from '@/components/teams/RosterTable';
import { Badge } from '@/components/ui/badge';
import { formatRecord, formatWinRate } from '@/lib/format';

// The phone layout of a roster: one card per player, ⋮ for make captain, transfer, remove.
export const RosterCards = ({ players, ...actions }: RosterListProps) => {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li
          key={player.roster_id}
          className="flex items-start gap-3 rounded-card border border-line bg-card p-3"
        >
          <PlayerAvatar player={player} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-2 font-medium">
              {player.full_name}
              {player.is_captain && <Badge variant="secondary">{t('teams.roster.captain')}</Badge>}
            </span>
            <span className="tabular text-xs text-muted-foreground">{player.member_id}</span>
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <SkillLevelSquare skillLevel={player.skill_level} />
              <FeeBadge isPaid={player.is_paid} />
              <span className="tabular text-muted-foreground">
                {t('teams.roster.cardStats', {
                  record: formatRecord(player.matches_won, player.matches_played),
                  winRate: formatWinRate(player.matches_won, player.matches_played),
                  points: player.total_points,
                })}
              </span>
            </span>
          </div>
          <PlayerActionsMenu player={player} {...actions} />
        </li>
      ))}
    </ul>
  );
};
