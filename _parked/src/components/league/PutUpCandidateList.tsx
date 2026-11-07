import { useTranslation } from 'react-i18next';

import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { Check } from '@/lib/icons';
import { raceFor } from '@/lib/rules';
import { cn } from 'cn';
import type { AvailablePlayer } from '@/types/league';

interface PutUpCandidateListProps {
  players: readonly AvailablePlayer[];
  opponentSkillLevel: number | null;
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
}

export default function PutUpCandidateList({
  players,
  opponentSkillLevel,
  selectedPlayerId,
  onSelect,
}: PutUpCandidateListProps) {
  const { t } = useTranslation();

  return (
    <ul
      className="divide-y divide-line overflow-hidden rounded-card border border-line bg-card"
      role="radiogroup"
      aria-label={t('putUp.selectPlayer')}
    >
      {players.map((player) => {
        const isSelected = player.playerId === selectedPlayerId;
        // The race exists only once the opponent is up. When this side goes first the race
        // is genuinely unknown, so the cell stays empty rather than showing a guess.
        const race =
          opponentSkillLevel === null ? null : raceFor(player.skillLevel, opponentSkillLevel);

        return (
          <li key={player.playerId}>
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              // Blocked rows stay focusable so a screen-reader user hears *why* their best
              // player is unavailable. Greyed out, never hidden.
              aria-disabled={!player.canPutUp}
              onClick={() => {
                if (player.canPutUp) {
                  onSelect(player.playerId);
                }
              }}
              className={cn(
                'flex min-h-14 w-full items-center gap-3 p-3 text-left',
                !player.canPutUp && 'bg-chip',
                isSelected && 'bg-sel-row',
              )}
            >
              <SkillLevelSquare skillLevel={player.skillLevel} />

              <span className="min-w-0 flex-1">
                <span className={cn('block truncate', !player.canPutUp && 'text-muted-foreground')}>
                  {player.fullName}
                </span>
                <span className="block text-xs text-muted-foreground">{player.memberId}</span>
              </span>

              {player.blockReason !== null ? (
                <span className="shrink-0 rounded-chip bg-[color-mix(in_oklab,var(--warn)_12%,var(--card))] px-2 py-1 text-xs font-medium text-warn">
                  {t(`putUp.reason.${player.blockReason}`)}
                </span>
              ) : (
                race !== null && (
                  <span className="tabular shrink-0 text-sm font-medium">
                    {`${race.home}–${race.away}`}
                  </span>
                )
              )}

              {isSelected && <Check className="size-5 shrink-0 text-primary" aria-hidden />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
