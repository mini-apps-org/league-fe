import { cn } from 'cn';

import { getInitials } from '@/lib/format';
import type { RosterPlayer } from '@/types/teams';

interface PlayerAvatarProps {
  player: RosterPlayer;
}

// Initials, filled teal for the captain.
export const PlayerAvatar = ({ player }: PlayerAvatarProps) => {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        player.is_captain ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary',
      )}
    >
      {getInitials(player.full_name)}
    </span>
  );
};
