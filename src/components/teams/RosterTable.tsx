import { useTranslation } from 'react-i18next';

import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import { FeeBadge } from '@/components/teams/FeeBadge';
import { type PlayerActions, PlayerActionsMenu } from '@/components/teams/PlayerActionsMenu';
import { PlayerAvatar } from '@/components/teams/PlayerAvatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatWinRate } from '@/lib/format';
import type { RosterPlayer } from '@/types/teams';

export interface RosterListProps extends PlayerActions {
  players: RosterPlayer[];
}

export const RosterTable = ({ players, ...actions }: RosterListProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-card border border-line bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('teams.roster.columns.player')}</TableHead>
            <TableHead>{t('teams.roster.columns.skill')}</TableHead>
            <TableHead>{t('teams.roster.columns.fees')}</TableHead>
            <TableHead className="text-right">{t('teams.roster.columns.played')}</TableHead>
            <TableHead className="text-right">{t('teams.roster.columns.won')}</TableHead>
            <TableHead className="text-right">{t('teams.roster.columns.winRate')}</TableHead>
            <TableHead className="text-right">{t('teams.roster.columns.points')}</TableHead>
            <TableHead>{t('teams.roster.columns.joined')}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t('teams.roster.columns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.roster_id}>
              <TableCell>
                <span className="flex items-center gap-3">
                  <PlayerAvatar player={player} />
                  <span className="flex flex-col">
                    <span className="flex items-center gap-2 font-medium">
                      {player.full_name}
                      {player.is_captain && (
                        <Badge variant="secondary">{t('teams.roster.captain')}</Badge>
                      )}
                    </span>
                    <span className="tabular text-xs text-muted-foreground">
                      {player.member_id}
                    </span>
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <SkillLevelSquare skillLevel={player.skill_level} />
              </TableCell>
              <TableCell>
                <FeeBadge isPaid={player.is_paid} />
              </TableCell>
              <TableCell className="tabular text-right">{player.matches_played}</TableCell>
              <TableCell className="tabular text-right">{player.matches_won}</TableCell>
              <TableCell className="tabular text-right">
                {formatWinRate(player.matches_won, player.matches_played)}
              </TableCell>
              <TableCell className="tabular text-right">{player.total_points}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(player.joined_at)}
              </TableCell>
              <TableCell>
                <PlayerActionsMenu player={player} {...actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
