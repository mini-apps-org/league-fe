import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { CaptainBadge } from '@/components/teams/CaptainBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { Trash2 } from '@/lib/icons';
import { getTeamPath } from '@/lib/team-paths';
import type { Team } from '@/types/teams';

export interface TeamRowsProps {
  teams: Team[];
  // Set when the list is filtered by a division, so a team opens on that division's roster.
  divisionId: string;
  selectedIds: ReadonlySet<string>;
  onToggle: (teamId: string) => void;
  onToggleAll: (checked: boolean) => void;
  // Undefined when the user cannot delete teams: no checkboxes, no delete action.
  onDelete?: (team: Team) => void;
}

export const TeamsTable = ({
  teams,
  divisionId,
  selectedIds,
  onToggle,
  onToggleAll,
  onDelete,
}: TeamRowsProps) => {
  const { t } = useTranslation();
  const canDelete = onDelete !== undefined;
  const selectedOnPage = teams.filter((team) => selectedIds.has(team.id)).length;
  const allChecked = selectedOnPage > 0 && selectedOnPage === teams.length;
  const headerChecked = selectedOnPage > 0 && !allChecked ? 'indeterminate' : allChecked;

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {canDelete && (
              <TableHead className="w-10">
                <Checkbox
                  checked={headerChecked}
                  aria-label={t('teams.list.selectAll')}
                  onCheckedChange={(checked) => {
                    onToggleAll(checked === true);
                  }}
                />
              </TableHead>
            )}
            <TableHead>{t('teams.list.columns.team')}</TableHead>
            <TableHead>{t('teams.list.columns.captain')}</TableHead>
            <TableHead>{t('teams.list.columns.created')}</TableHead>
            {canDelete && (
              <TableHead className="w-12">
                <span className="sr-only">{t('teams.list.columns.actions')}</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => {
            const isSelected = selectedIds.has(team.id);

            return (
              <TableRow key={team.id} data-state={isSelected ? 'selected' : undefined}>
                {canDelete && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      aria-label={t('teams.list.select', { name: team.name })}
                      onCheckedChange={() => {
                        onToggle(team.id);
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <span className="flex items-center gap-3">
                    <span className="tabular rounded-chip bg-sunken px-2 py-0.5 font-mono text-xs">
                      {team.team_code}
                    </span>
                    <Link
                      to={getTeamPath(team.id, divisionId)}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {team.name}
                    </Link>
                  </span>
                </TableCell>
                <TableCell>
                  <CaptainBadge hasCaptain={team.captain_player_id !== null} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(team.created_at)}
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('teams.delete.action', { name: team.name })}
                      onClick={() => {
                        onDelete(team);
                      }}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
