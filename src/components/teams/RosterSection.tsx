import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/league/EmptyState';
import { ErrorBanner } from '@/components/league/ErrorBanner';
import { LoadMoreFooter } from '@/components/league/LoadMoreFooter';
import { ScrollableTable } from '@/components/league/ScrollableTable';
import { IdFilterInput } from '@/components/teams/IdFilterInput';
import type { PlayerActions } from '@/components/teams/PlayerActionsMenu';
import { RosterCards } from '@/components/teams/RosterCards';
import { RosterTable } from '@/components/teams/RosterTable';
import { TeamsTableSkeleton } from '@/components/teams/TeamsTableSkeleton';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useMobile';
import { isNotFoundError } from '@/lib/errors';
import { Layers, Plus, UserPlus } from '@/lib/icons';
import type { ApiPage } from '@/types/api';
import type { RosterPlayer } from '@/types/teams';

interface RosterSectionProps {
  divisionId: string;
  // Bumped when the division changes from outside the input (added or removed), so the
  // input shows it; typing must not remount it, or it would lose focus.
  divisionInputKey: number;
  rosterQuery: UseInfiniteQueryResult<InfiniteData<ApiPage<RosterPlayer>>>;
  pageSize: number;
  playerActions: PlayerActions;
  onDivisionChange: (divisionId: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Each is undefined when the user lacks its permission.
  onAddPlayer?: () => void;
  onAddDivision?: () => void;
  onRemoveDivision?: () => void;
}

// league-be can't list a team's divisions yet, so the division is chosen by id and kept in the
// URL; the list page passes it along when it is filtered by one.
export const RosterSection = ({
  divisionId,
  divisionInputKey,
  rosterQuery,
  pageSize,
  playerActions,
  onDivisionChange,
  onPageSizeChange,
  onAddPlayer,
  onAddDivision,
  onRemoveDivision,
}: RosterSectionProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const players = rosterQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = rosterQuery.data?.pages[0]?.metadata.total ?? players.length;
  const isInitialError = rosterQuery.isError && rosterQuery.data === undefined;
  const hasDivision = divisionId !== '';

  const addDivisionButton =
    onAddDivision === undefined ? undefined : (
      <Button variant="outline" onClick={onAddDivision}>
        <Plus aria-hidden />
        {t('teams.addDivision.title')}
      </Button>
    );

  const renderBody = () => {
    if (!hasDivision) {
      return (
        <EmptyState
          icon={Layers}
          title={t('teams.roster.chooseDivisionTitle')}
          body={t('teams.roster.chooseDivisionBody')}
        />
      );
    }

    if (rosterQuery.isPending) {
      return <TeamsTableSkeleton />;
    }

    // A 404 here means the team never entered this division, not that the team is gone.
    if (isInitialError && isNotFoundError(rosterQuery.error)) {
      return (
        <EmptyState
          icon={Layers}
          title={t('teams.roster.notEnteredTitle')}
          body={t('teams.roster.notEnteredBody')}
          action={addDivisionButton}
        />
      );
    }

    if (isInitialError) {
      return (
        <ErrorBanner
          error={rosterQuery.error}
          onRetry={() => {
            void rosterQuery.refetch();
          }}
        />
      );
    }

    if (players.length === 0) {
      return (
        <EmptyState
          icon={UserPlus}
          title={t('teams.roster.emptyTitle')}
          body={t('teams.roster.emptyBody')}
          action={
            onAddPlayer === undefined ? undefined : (
              <Button onClick={onAddPlayer}>{t('teams.addPlayer.title')}</Button>
            )
          }
        />
      );
    }

    return (
      <>
        <ScrollableTable
          hasMore={rosterQuery.hasNextPage && !rosterQuery.isFetchNextPageError}
          isLoadingMore={rosterQuery.isFetchingNextPage}
          onLoadMore={() => {
            void rosterQuery.fetchNextPage();
          }}
        >
          {isMobile ? (
            <RosterCards players={players} {...playerActions} />
          ) : (
            <RosterTable players={players} {...playerActions} />
          )}
        </ScrollableTable>
        {rosterQuery.isFetchNextPageError && (
          <ErrorBanner
            error={rosterQuery.error}
            onRetry={() => {
              void rosterQuery.fetchNextPage();
            }}
          />
        )}
        <LoadMoreFooter
          summary={t('teams.roster.showing', { shown: players.length, total })}
          pageSize={pageSize}
          hasMore={rosterQuery.hasNextPage}
          endLabel={t('teams.roster.allLoaded', { count: total })}
          onPageSizeChange={onPageSizeChange}
        />
        <p className="text-sm text-muted-foreground">{t('teams.roster.captainNote')}</p>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="roster-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 id="roster-heading" className="text-lg font-semibold">
          {t('teams.roster.title')}
        </h3>
        {addDivisionButton}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="md:w-96">
          <IdFilterInput
            key={divisionInputKey}
            label={t('teams.form.divisionId')}
            initialValue={divisionId}
            disabled={false}
            onApply={onDivisionChange}
          />
        </div>
        {hasDivision && rosterQuery.isSuccess && onRemoveDivision !== undefined && (
          <Button variant="ghost" className="text-destructive" onClick={onRemoveDivision}>
            {t('teams.removeDivision.open')}
          </Button>
        )}
      </div>
      {renderBody()}
    </section>
  );
};
