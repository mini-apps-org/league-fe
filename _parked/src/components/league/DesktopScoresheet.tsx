import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { Button } from '@/components/ui/button';
import { MATCHES_PER_NIGHT, nextAction } from '@/lib/night';
import type { IndividualMatch, TeamMatchDetail } from '@/types/league';

const ORDERS = Array.from({ length: MATCHES_PER_NIGHT }, (_, index) => {
  return index + 1;
});

interface PlayerCellProps {
  name: string | null;
  skillLevel: number | null;
}

function PlayerCell({ name, skillLevel }: PlayerCellProps) {
  if (name === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="flex items-center gap-2">
      {skillLevel !== null && <SkillLevelSquare skillLevel={skillLevel} />}
      <span className="truncate">{name}</span>
    </span>
  );
}

// The whole night as one table, per the design's desktop layout. Result *entry* stays the
// dedicated screen at every width: the steppers are the same controls, and duplicating them
// inline would mean two code paths for the one write that must not go wrong.
export default function DesktopScoresheet({ detail }: { detail: TeamMatchDetail }) {
  const { t } = useTranslation();
  const action = nextAction(detail);
  // Only put-up and result name a match; submit and done do not.
  const currentOrder =
    action.kind === 'put-up' || action.kind === 'result' ? action.matchOrder : null;

  const matchFor = (order: number): IndividualMatch | undefined => {
    return detail.matches.find((candidate) => {
      return candidate.matchOrder === order;
    });
  };

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full border-collapse">
        <caption className="sr-only">{t('night.summaryTitle')}</caption>
        <thead>
          <tr className="border-b border-line bg-sunken text-xs font-medium text-muted-foreground">
            <th scope="col" className="px-3 py-2 text-left">
              #
            </th>
            <th scope="col" className="px-3 py-2 text-left">
              {t('roster.home')}
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              {t('result.gamesWon')}
            </th>
            <th scope="col" className="px-3 py-2 text-left">
              {t('roster.away')}
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              {t('result.gamesWon')}
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              {t('roster.points')}
            </th>
            <th scope="col" className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((order) => {
            const match = matchFor(order);
            const played = match?.status === 'complete';
            const isCurrent = currentOrder === order;

            return (
              <tr
                key={order}
                className={isCurrent ? 'border-b border-line bg-sel-row' : 'border-b border-line'}
              >
                <td className="px-3 py-2 text-sm text-muted-foreground">{order}</td>
                <td className="max-w-48 px-3 py-2">
                  <PlayerCell
                    name={match?.homePlayerName ?? null}
                    skillLevel={match?.homeSkillLevel ?? null}
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {played ? match.homeGames : '—'}
                </td>
                <td className="max-w-48 px-3 py-2">
                  <PlayerCell
                    name={match?.awayPlayerName ?? null}
                    skillLevel={match?.awaySkillLevel ?? null}
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {played ? match.awayGames : '—'}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {played ? `${match.homePoints}–${match.awayPoints}` : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  {isCurrent && detail.viewerCanManage && (
                    <Button asChild variant="outline" className="h-9">
                      <Link
                        to={
                          action.kind === 'put-up'
                            ? `/matches/${detail.id}/put-up`
                            : `/matches/${detail.id}/result/${order}`
                        }
                      >
                        {action.kind === 'put-up' ? t('putUp.confirm') : t('result.save')}
                      </Link>
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-sunken font-semibold">
            <td className="px-3 py-2" colSpan={5}>
              {t('night.summaryTitle')}
            </td>
            <td className="px-3 py-2 text-right text-lg">
              {`${detail.homePoints}–${detail.awayPoints}`}
            </td>
            <td className="px-3 py-2" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
