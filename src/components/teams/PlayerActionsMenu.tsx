import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowRightLeft, Crown, EllipsisVertical, UserMinus } from '@/lib/icons';
import type { RosterPlayer } from '@/types/teams';

// Each handler is undefined when the user lacks its permission, and its item is not shown.
export interface PlayerActions {
  onMakeCaptain?: (player: RosterPlayer) => void;
  onTransfer?: (player: RosterPlayer) => void;
  onRemove?: (player: RosterPlayer) => void;
}

interface PlayerActionsMenuProps extends PlayerActions {
  player: RosterPlayer;
}

// The captain can't be transferred or removed: league-be answers 409 until another player is
// captain, so those items stay visible but disabled, with the reason as their label.
export const PlayerActionsMenu = ({
  player,
  onMakeCaptain,
  onTransfer,
  onRemove,
}: PlayerActionsMenuProps) => {
  const { t } = useTranslation();

  if (onMakeCaptain === undefined && onTransfer === undefined && onRemove === undefined) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('teams.roster.actions', { name: player.full_name })}
        >
          <EllipsisVertical aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onMakeCaptain !== undefined && (
          <DropdownMenuItem
            disabled={player.is_captain}
            onSelect={() => {
              onMakeCaptain(player);
            }}
          >
            <Crown aria-hidden />
            {player.is_captain ? t('teams.roster.isCaptain') : t('teams.roster.makeCaptain')}
          </DropdownMenuItem>
        )}
        {onTransfer !== undefined && (
          <DropdownMenuItem
            disabled={player.is_captain}
            onSelect={() => {
              onTransfer(player);
            }}
          >
            <ArrowRightLeft aria-hidden />
            {player.is_captain ? t('teams.roster.captainNoTransfer') : t('teams.roster.transfer')}
          </DropdownMenuItem>
        )}
        {onRemove !== undefined && (
          <DropdownMenuItem
            variant="destructive"
            disabled={player.is_captain}
            onSelect={() => {
              onRemove(player);
            }}
          >
            <UserMinus aria-hidden />
            {player.is_captain ? t('teams.roster.captainNoRemove') : t('teams.roster.remove')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
