import { cn } from 'cn';
import { useTranslation } from 'react-i18next';

import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import type { IndividualMatch } from '@/types/league';

interface PlayerLineProps {
  name: string;
  skillLevel: number | null;
  games: number;
  isWinner: boolean;
}

function PlayerLine({ name, skillLevel, games, isWinner }: PlayerLineProps) {
  return (
    <p
      className={cn(
        'flex min-h-10 items-center gap-2.5 rounded-[10px] pr-3 pl-1.5',
        isWinner && 'bg-ok-soft font-semibold',
      )}
    >
      {skillLevel !== null && <SkillLevelSquare skillLevel={skillLevel} />}
      <span className="min-w-0 flex-1 truncate">{name}</span>
      <span className={cn('tabular text-lg', isWinner && 'font-semibold')}>{games}</span>
    </p>
  );
}

interface ScoresheetRowProps {
  order: number;
  match: IndividualMatch | undefined;
}

// Rendered inside a <ul> card; one row per match order, played or not.
export function ScoresheetRow({ order, match }: ScoresheetRowProps) {
  const { t } = useTranslation();
  const isPlayed = match?.status === 'complete';

  if (match === undefined || !isPlayed) {
    return (
      <li className="flex flex-col gap-1 border-t border-line px-4 pt-2.5 pb-3.5 first:border-t-0">
        <span className="text-[13px] font-semibold text-text-2">
          {t('night.matchN', { n: order })}
        </span>
        <span className="text-muted-foreground">{t('night.notPlayed')}</span>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 border-t border-line px-3 pt-2.5 pb-3 first:border-t-0">
      <p className="tabular flex justify-between px-1 text-[13px] text-muted-foreground">
        <span className="font-semibold text-text-2">{t('night.matchN', { n: order })}</span>
        <span>
          {t('night.raceLine', {
            homeRace: match.homeRace ?? '–',
            awayRace: match.awayRace ?? '–',
            homePoints: match.homePoints,
            awayPoints: match.awayPoints,
          })}
        </span>
      </p>
      <PlayerLine
        name={match.homePlayerName ?? ''}
        skillLevel={match.homeSkillLevel}
        games={match.homeGames}
        isWinner={match.homePoints > match.awayPoints}
      />
      <PlayerLine
        name={match.awayPlayerName ?? ''}
        skillLevel={match.awaySkillLevel}
        games={match.awayGames}
        isWinner={match.awayPoints > match.homePoints}
      />
    </li>
  );
}
