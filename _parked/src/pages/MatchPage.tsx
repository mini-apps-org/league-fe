import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import DesktopScoresheet from '@/components/league/DesktopScoresheet';
import ErrorBanner from '@/components/league/ErrorBanner';
import NightActionBar from '@/components/league/NightActionBar';
import NightScoresheet from '@/components/league/NightScoresheet';
import RosterPanel from '@/components/league/RosterPanel';
import ScoreStrip from '@/components/league/ScoreStrip';
import StatusBadge from '@/components/league/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamMatch } from '@/hooks/useLeague';
import { formatFixtureDateTime } from '@/lib/format';
import { ArrowLeft } from '@/lib/icons';
import type { TeamMatchDetail } from '@/types/league';

function hasAnyPutUp(detail: TeamMatchDetail): boolean {
  return detail.matches.some((match) => {
    return match.homePlayerId !== null || match.awayPlayerId !== null;
  });
}

export default function MatchPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const match = useTeamMatch(id);
  const detail = match.data;

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <Button asChild variant="ghost" className="-ml-2 h-11 px-2">
        <Link to="/">
          <ArrowLeft className="size-5" aria-hidden />
          {t('common.back')}
        </Link>
      </Button>

      {match.error !== null && (
        <ErrorBanner
          error={match.error}
          onRetry={() => {
            void match.refetch();
          }}
        />
      )}

      {match.isPending && (
        <div className="space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      )}

      {detail !== undefined && (
        <>
          <header className="space-y-1">
            <h1 className="tabular text-xl font-semibold">
              {`${detail.homeTeam.teamNumber} ${t('schedule.vs')} ${detail.awayTeam.teamNumber}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {detail.venue === null
                  ? formatFixtureDateTime(detail.scheduledAt)
                  : `${detail.venue.name} · ${formatFixtureDateTime(detail.scheduledAt)}`}
              </p>
              <StatusBadge status={detail.status} />
            </div>
          </header>

          {detail.status !== 'scheduled' && <ScoreStrip detail={detail} />}

          {hasAnyPutUp(detail) && (
            <>
              <div className="lg:hidden">
                <NightScoresheet detail={detail} />
              </div>
              <div className="hidden lg:block">
                <DesktopScoresheet detail={detail} />
              </div>
            </>
          )}

          <div className="lg:hidden">
            <Tabs defaultValue={detail.viewerSide ?? 'home'}>
              <TabsList className="w-full">
                <TabsTrigger value="home" className="flex-1">
                  {t('roster.home')}
                </TabsTrigger>
                <TabsTrigger value="away" className="flex-1">
                  {t('roster.away')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="pt-3">
                <RosterPanel
                  teamMatchId={detail.id}
                  teamId={detail.homeTeam.id}
                  players={detail.homeRoster}
                  canManage={detail.viewerCanManage}
                />
              </TabsContent>

              <TabsContent value="away" className="pt-3">
                <RosterPanel
                  teamMatchId={detail.id}
                  teamId={detail.awayTeam.id}
                  players={detail.awayRoster}
                  canManage={detail.viewerCanManage}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden gap-6 lg:grid lg:grid-cols-2">
            <RosterPanel
              teamMatchId={detail.id}
              teamId={detail.homeTeam.id}
              players={detail.homeRoster}
              canManage={detail.viewerCanManage}
              heading={`${detail.homeTeam.teamNumber} ${detail.homeTeam.name}`}
            />
            <RosterPanel
              teamMatchId={detail.id}
              teamId={detail.awayTeam.id}
              players={detail.awayRoster}
              canManage={detail.viewerCanManage}
              heading={`${detail.awayTeam.teamNumber} ${detail.awayTeam.name}`}
            />
          </div>

          {/* Sticky on a phone, where a captain holds it one-handed; static at lg, where
              there is no thumb-reach problem. pb-24 reserves room for the fixed bar so the
              last roster row is never trapped underneath. */}
          <div className="fixed inset-x-0 bottom-0 border-t border-line bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:bg-transparent lg:p-0">
            <div className="mx-auto w-full max-w-3xl">
              <NightActionBar detail={detail} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
