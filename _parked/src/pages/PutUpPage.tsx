import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyState from '@/components/league/EmptyState';
import ErrorBanner from '@/components/league/ErrorBanner';
import PutUpCandidateList from '@/components/league/PutUpCandidateList';
import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailablePlayers, useTeamMatch } from '@/hooks/useLeague';
import { usePutUp } from '@/hooks/useLeagueMutations';
import { ArrowLeft, Users } from '@/lib/icons';
import { nextAction } from '@/lib/night';
import { skillLevelUsed } from '@/lib/rules';
import type { IndividualMatch, Side, TeamMatchDetail } from '@/types/league';

// Snapshot skill levels this side has already committed tonight. Display only — the block
// decision is the server's can_put_up().
function usedSkillLevel(detail: TeamMatchDetail, side: Side): number {
  const levels = detail.matches
    .map((match) => {
      return side === 'home' ? match.homeSkillLevel : match.awaySkillLevel;
    })
    .filter((level): level is number => {
      return level !== null;
    });

  return skillLevelUsed(levels);
}

// Which side is being asked to pick, said plainly rather than as a nested ternary in JSX.
// first_put_up comes from the row, so the client never recomputes the alternation.
function putUpSubtitleKey(side: Side, match: IndividualMatch | undefined): string {
  if (match !== undefined && match.firstPutUp === side) {
    return 'putUp.yourPick';
  }

  return side === 'home' ? 'putUp.homeFirst' : 'putUp.awayFirst';
}

function opponentOf(match: IndividualMatch | undefined, side: Side): IndividualMatch | undefined {
  if (match === undefined) {
    return undefined;
  }

  const opponentId = side === 'home' ? match.awayPlayerId : match.homePlayerId;

  return opponentId === null ? undefined : match;
}

export default function PutUpPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamMatch = useTeamMatch(id);
  const detail = teamMatch.data;

  const action = detail === undefined ? null : nextAction(detail);
  const isPutUpTurn = action?.kind === 'put-up';
  const matchOrder = isPutUpTurn ? action.matchOrder : undefined;
  const side = isPutUpTurn ? action.side : undefined;

  const available = useAvailablePlayers(id, side, matchOrder);
  const putUp = usePutUp(id ?? '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const currentMatch = detail?.matches.find((match) => {
    return match.matchOrder === matchOrder;
  });
  const opponentMatch = side === undefined ? undefined : opponentOf(currentMatch, side);
  const opponentSkillLevel =
    opponentMatch === undefined || side === undefined
      ? null
      : side === 'home'
        ? opponentMatch.awaySkillLevel
        : opponentMatch.homeSkillLevel;
  const opponentName =
    opponentMatch === undefined || side === undefined
      ? null
      : side === 'home'
        ? opponentMatch.awayPlayerName
        : opponentMatch.homePlayerName;

  const candidates = available.data ?? [];
  const error = teamMatch.error ?? available.error ?? putUp.error;

  return (
    <div className="space-y-4 pb-24">
      <Button asChild variant="ghost" className="-ml-2 h-11 px-2">
        <Link to={`/matches/${id ?? ''}`}>
          <ArrowLeft className="size-5" aria-hidden />
          {t('common.back')}
        </Link>
      </Button>

      {error !== null && error !== undefined && (
        <ErrorBanner
          error={error}
          onRetry={() => {
            void available.refetch();
          }}
        />
      )}

      {teamMatch.isPending && <Skeleton className="h-64 w-full rounded-card" />}

      {detail !== undefined && isPutUpTurn && side !== undefined && matchOrder !== undefined && (
        <>
          <header className="space-y-1">
            <h1 className="text-xl font-semibold">{t('putUp.title', { n: matchOrder })}</h1>
            <p className="text-sm text-muted-foreground">
              {t(putUpSubtitleKey(side, currentMatch))}
            </p>
          </header>

          <div className="flex justify-end">
            <span className="tabular rounded-chip bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {t('putUp.slUsed', {
                used: usedSkillLevel(detail, side),
                cap: detail.skillLevelCap,
              })}
            </span>
          </div>

          {opponentName !== null && opponentSkillLevel !== null && (
            <div className="space-y-2 rounded-lg bg-sunken p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t('putUp.opponentPutUp')}
              </p>
              <p className="flex items-center gap-2">
                <SkillLevelSquare skillLevel={opponentSkillLevel} />
                <span className="font-medium">{opponentName}</span>
              </p>
            </div>
          )}

          {!available.isPending && candidates.length === 0 ? (
            <EmptyState icon={Users} title={t('putUp.emptyTitle')} body={t('putUp.emptyBody')} />
          ) : (
            <PutUpCandidateList
              players={candidates}
              opponentSkillLevel={opponentSkillLevel}
              selectedPlayerId={selectedPlayerId}
              onSelect={setSelectedPlayerId}
            />
          )}

          <div className="fixed inset-x-0 bottom-0 border-t border-line bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-3xl">
              <Button
                className="h-12 w-full"
                disabled={selectedPlayerId === null || putUp.isPending}
                onClick={() => {
                  if (selectedPlayerId === null) {
                    return;
                  }

                  putUp.mutate(
                    { matchOrder, side, playerId: selectedPlayerId },
                    {
                      onSuccess: (saved) => {
                        setSelectedPlayerId(null);

                        // Both sides up means the match can be scored; otherwise this screen
                        // re-renders for the other side's pick.
                        if (saved.homePlayerId !== null && saved.awayPlayerId !== null) {
                          void navigate(`/matches/${id ?? ''}/result/${matchOrder}`);
                        }
                      },
                    },
                  );
                }}
              >
                {t('putUp.confirm')}
              </Button>
            </div>
          </div>
        </>
      )}

      {detail !== undefined && !isPutUpTurn && (
        <EmptyState icon={Users} title={t('putUp.emptyTitle')} body={t('putUp.emptyBody')} />
      )}
    </div>
  );
}
