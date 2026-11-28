import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { CaptainBadge } from '@/components/teams/CaptainBadge';
import type { TeamRowsProps } from '@/components/teams/TeamsTable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from '@/lib/icons';
import { getTeamPath } from '@/lib/team-paths';

// The phone layout of the Teams list: one card per team, ⋮ for its actions.
export const TeamCards = ({
  teams,
  divisionId,
  selectedIds,
  onToggle,
  onToggleAll,
  onDelete,
}: TeamRowsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedOnPage = teams.filter((team) => selectedIds.has(team.id)).length;
  const allChecked = selectedOnPage > 0 && selectedOnPage === teams.length;
  const selectAllChecked = selectedOnPage > 0 && !allChecked ? 'indeterminate' : allChecked;

  return (
    <ul className="flex flex-col gap-2">
      {onDelete !== undefined && (
        <li>
          <label className="flex items-center gap-3 px-3 py-1 text-sm text-muted-foreground">
            <Checkbox
              checked={selectAllChecked}
              onCheckedChange={(checked) => {
                onToggleAll(checked === true);
              }}
            />
            {t('teams.list.selectAll')}
          </label>
        </li>
      )}
      {teams.map((team) => {
        const teamPath = getTeamPath(team.id, divisionId);

        return (
          <li
            key={team.id}
            className="flex items-start gap-3 rounded-card border border-line bg-card p-3"
          >
            {onDelete !== undefined && (
              <Checkbox
                className="mt-1"
                checked={selectedIds.has(team.id)}
                aria-label={t('teams.list.select', { name: team.name })}
                onCheckedChange={() => {
                  onToggle(team.id);
                }}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="tabular text-xs text-muted-foreground">{team.team_code}</span>
              <Link to={teamPath} className="truncate font-medium text-foreground">
                {team.name}
              </Link>
              <span>
                <CaptainBadge hasCaptain={team.captain_player_id !== null} />
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('teams.list.actions', { name: team.name })}
                >
                  <EllipsisVertical aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    void navigate(teamPath);
                  }}
                >
                  {t('teams.list.open')}
                </DropdownMenuItem>
                {onDelete !== undefined && (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      onDelete(team);
                    }}
                  >
                    {t('teams.delete.submit')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ul>
  );
};
