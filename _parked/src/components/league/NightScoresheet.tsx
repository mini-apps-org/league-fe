import { useTranslation } from 'react-i18next';

import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { MATCHES_PER_NIGHT } from '@/lib/night';
import { cn } from 'cn';
import type { IndividualMatch, TeamMatchDetail } from '@/types/league';

// Array.from's callback is not one of the array methods the lint rule exempts.
const ORDERS = Array.from({ length: MATCHES_PER_NIGHT }, (_, index) => {
  return index + 1;
});

interface SideCellProps {
  name: string | null;
  skillLevel: number | null;
  games: number;
  isWinner: boolean;
  played: boolean;
}

function SideCell({ name, skillLevel, games, isWinner, played }: SideCellProps) {
  const { t } = useTranslation();

  if (name === null) {
    return <span className="text-sm text-muted-foreground">{t('night.notPlayed')}</span>;
  }

  return (
    <span className="flex items-center gap-2">
      {skillLevel !== null && <SkillLevelSquare skillLevel={skillLevel} />}
      <span className={cn('min-w-0 flex-1 truncate text-sm', isWinner && 'font-medium text-ok')}>
        {name}
      </span>
      {played && <span className="tabular text-sm font-medium">{games}</span>}
    </span>
  );
}

function matchFor(detail: TeamMatchDetail, order: number): IndividualMatch | undefined {
  return detail.matches.find((candidate) => candidate.matchOrder === order);
}

interface NightScoresheetProps {
  detail: TeamMatchDetail;
}

// The night as five rows. Doubles as the summary after match 5, which is why it renders
// unplayed rows rather than only what exists.
export default function NightScoresheet({ detail }: NightScoresheetProps) {
  const { t } = useTranslation();

  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-card">
      {ORDERS.map((order) => {
        const match = matchFor(detail, order);
        const played = match?.status === 'complete';
        const homeWon = played && match !== undefined && match.homePoints > match.awayPoints;
        const awayWon = played && match !== undefined && match.awayPoints > match.homePoints;

        return (
          <li key={order} className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {t('night.matchN', { n: order })}
              </p>
              {played && match !== undefined && (
                <p className="tabular text-xs font-medium">
                  {t('result.verdictPoints', {
                    winnerPoints: match.homePoints,
                    loserPoints: match.awayPoints,
                  })}
                </p>
              )}
            </div>

            <SideCell
              name={match?.homePlayerName ?? null}
              skillLevel={match?.homeSkillLevel ?? null}
              games={match?.homeGames ?? 0}
              isWinner={homeWon}
              played={played}
            />
            <SideCell
              name={match?.awayPlayerName ?? null}
              skillLevel={match?.awaySkillLevel ?? null}
              games={match?.awayGames ?? 0}
              isWinner={awayWon}
              played={played}
            />
          </li>
        );
      })}
    </ul>
  );
}
