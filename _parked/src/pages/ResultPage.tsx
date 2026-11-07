import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ErrorBanner from '@/components/league/ErrorBanner';
import ResultVerdict from '@/components/league/ResultVerdict';
import Stepper from '@/components/league/Stepper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamMatch } from '@/hooks/useLeague';
import { useSaveResult } from '@/hooks/useLeagueMutations';
import { ArrowLeft } from '@/lib/icons';
import { pointsFor } from '@/lib/rules';
import { resultSchema } from '@/lib/schemas';

interface ResultDraft {
  homeGames: number;
  awayGames: number;
  innings: number;
  homeDefShots: number;
  awayDefShots: number;
}

export default function ResultPage() {
  const { t } = useTranslation();
  const { id, order } = useParams<{ id: string; order: string }>();
  const navigate = useNavigate();
  const teamMatch = useTeamMatch(id);
  const saveResult = useSaveResult(id ?? '');

  const matchOrder = Number(order);
  const match = teamMatch.data?.matches.find((candidate) => {
    return candidate.matchOrder === matchOrder;
  });

  // An override on top of server data rather than a copy of it: null means "unedited", so a
  // refetch is still visible until the captain touches a stepper.
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const current: ResultDraft = draft ?? {
    homeGames: match?.homeGames ?? 0,
    awayGames: match?.awayGames ?? 0,
    innings: match?.innings ?? 0,
    homeDefShots: match?.homeDefShots ?? 0,
    awayDefShots: match?.awayDefShots ?? 0,
  };

  const update = (patch: Partial<ResultDraft>): void => {
    setDraft({ ...current, ...patch });
  };

  const homeRace = match?.homeRace ?? 0;
  const awayRace = match?.awayRace ?? 0;
  const verdict = pointsFor(current.homeGames, current.awayGames, homeRace, awayRace);
  const parsed = resultSchema.safeParse({ ...current, homeRace, awayRace });
  const error = teamMatch.error ?? saveResult.error;

  return (
    <div className="space-y-4 pb-24">
      <Button asChild variant="ghost" className="-ml-2 h-11 px-2">
        <Link to={`/matches/${id ?? ''}`}>
          <ArrowLeft className="size-5" aria-hidden />
          {t('common.back')}
        </Link>
      </Button>

      {error !== null && error !== undefined && <ErrorBanner error={error} />}

      {teamMatch.isPending && <Skeleton className="h-64 w-full rounded-card" />}

      {match !== undefined && (
        <>
          <header className="space-y-1">
            <h1 className="text-xl font-semibold">{t('result.title', { n: matchOrder })}</h1>
            <p className="text-sm text-muted-foreground">
              {t('result.racesTo', {
                name: match.homePlayerName ?? '',
                skillLevel: match.homeSkillLevel ?? 0,
                race: homeRace,
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('result.racesTo', {
                name: match.awayPlayerName ?? '',
                skillLevel: match.awaySkillLevel ?? 0,
                race: awayRace,
              })}
            </p>
          </header>

          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <p className="font-medium">{match.homePlayerName}</p>
            <p className="text-xs text-muted-foreground">{t('result.gamesWon')}</p>
            {/* Capped at this player's race, so an impossible score is unreachable through
                the UI rather than merely rejected on save. */}
            <Stepper
              label={t('result.gamesWon')}
              value={current.homeGames}
              max={homeRace}
              onChange={(value) => {
                update({ homeGames: value });
              }}
            />
          </section>

          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <p className="font-medium">{match.awayPlayerName}</p>
            <p className="text-xs text-muted-foreground">{t('result.gamesWon')}</p>
            <Stepper
              label={t('result.gamesWon')}
              value={current.awayGames}
              max={awayRace}
              onChange={(value) => {
                update({ awayGames: value });
              }}
            />
          </section>

          {/* Innings is per match; defensive shots are per player. Getting these the wrong
              way round is easy and silently wrong, so the labels carry the distinction. */}
          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <p className="text-xs text-muted-foreground">{t('result.innings')}</p>
            <Stepper
              label={t('result.innings')}
              value={current.innings}
              onChange={(value) => {
                update({ innings: value });
              }}
            />

            <p className="pt-2 text-xs text-muted-foreground">
              {`${t('result.defensiveShots')} · ${match.homePlayerName ?? ''}`}
            </p>
            <Stepper
              label={t('result.defensiveShots')}
              value={current.homeDefShots}
              onChange={(value) => {
                update({ homeDefShots: value });
              }}
            />

            <p className="pt-2 text-xs text-muted-foreground">
              {`${t('result.defensiveShots')} · ${match.awayPlayerName ?? ''}`}
            </p>
            <Stepper
              label={t('result.defensiveShots')}
              value={current.awayDefShots}
              onChange={(value) => {
                update({ awayDefShots: value });
              }}
            />
          </section>

          <ResultVerdict
            verdict={verdict}
            homeName={match.homePlayerName ?? ''}
            awayName={match.awayPlayerName ?? ''}
            homeGames={current.homeGames}
            awayGames={current.awayGames}
          />

          <div className="fixed inset-x-0 bottom-0 border-t border-line bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-3xl">
              <Button
                className="h-12 w-full"
                disabled={!parsed.success || saveResult.isPending}
                onClick={() => {
                  saveResult.mutate(
                    { individualMatchId: match.id, input: current },
                    {
                      onSuccess: () => {
                        setDraft(null);
                        void navigate(`/matches/${id ?? ''}`);
                      },
                    },
                  );
                }}
              >
                {t('result.save')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
