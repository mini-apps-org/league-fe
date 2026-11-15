import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import { useTranslation } from 'react-i18next';

import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import { formatRecord } from '@/lib/format';
import type { RosterPlayer } from '@/types/league';

const rosterRowVariants = cva(
  'flex min-h-15 items-center gap-3 border-b border-line py-2 pr-4 pl-3 last:border-b-0',
  {
    variants: {
      selection: {
        none: '',
        selected: 'bg-sel-row',
      },
    },
    defaultVariants: {
      selection: 'none',
    },
  },
);

interface StatProps {
  label: string;
  value: string | number;
  className?: string;
}

function Stat({ label, value, className }: StatProps) {
  return (
    <span className={cn('tabular flex flex-col items-end gap-px', className)}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </span>
  );
}

interface RosterRowProps {
  player: RosterPlayer;
  selection?: 'none' | 'selected';
}

// Rendered inside a <ul>; the card around the list (border, radius) belongs to the caller.
export function RosterRow({ player, selection = 'none' }: RosterRowProps) {
  const { t } = useTranslation();

  return (
    <li
      aria-current={selection === 'selected' ? 'true' : undefined}
      className={rosterRowVariants({ selection })}
    >
      <SkillLevelSquare skillLevel={player.skillLevel} />
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate font-medium">{player.fullName}</span>
        <span className="tabular text-[13px] text-muted-foreground">
          {player.memberId}
          {!player.isPaid && (
            <span className="font-medium text-warn">{` · ${t('roster.unpaid')}`}</span>
          )}
        </span>
      </span>
      {/* Zeros, never blanks: player_division_stats coalesces, so a player who has not
          played shows 0/0 rather than an empty cell. */}
      <Stat
        label={t('roster.record')}
        value={formatRecord(player.matchesWon, player.matchesPlayed)}
      />
      <Stat label={t('roster.points')} value={player.totalPoints} className="w-8.5" />
    </li>
  );
}
