import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/league/EmptyState';
import { ErrorBanner } from '@/components/league/ErrorBanner';
import { LoadMoreFooter } from '@/components/league/LoadMoreFooter';
import { ScrollableTable } from '@/components/league/ScrollableTable';
import { PageTitle } from '@/components/PageTitle';
import { BulkDeleteBar } from '@/components/teams/BulkDeleteBar';
import { BulkDeleteDrawer } from '@/components/teams/BulkDeleteDrawer';
import { type BulkDeleteOutcome, BulkDeleteResult } from '@/components/teams/BulkDeleteResult';
import { CreateTeamDrawer } from '@/components/teams/CreateTeamDrawer';
import { DeleteTeamDrawer } from '@/components/teams/DeleteTeamDrawer';
import { TeamCards } from '@/components/teams/TeamCards';
import { TeamsTable } from '@/components/teams/TeamsTable';
import { TeamsTableSkeleton } from '@/components/teams/TeamsTableSkeleton';
import { TeamsToolbar } from '@/components/teams/TeamsToolbar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useMobile';
import { useHasPermission } from '@/hooks/usePermissions';
import { type TeamFilterName, useTeamFilters } from '@/hooks/useTeamFilters';
import { useTeams } from '@/hooks/useTeams';
import { Plus, Search, Shield, TriangleAlert } from '@/lib/icons';
import type { Team } from '@/types/teams';

type TeamsDrawer = { kind: 'create' } | { kind: 'delete'; team: Team } | { kind: 'bulkDelete' };

export const AdminTeamsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const canCreate = useHasPermission('team.create');
  const canDelete = useHasPermission('team.delete');
  const { params, hasFilters, setFilter, clearFilters } = useTeamFilters();
  const teamsQuery = useTeams(params);
  const [toolbarKey, setToolbarKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [drawer, setDrawer] = useState<TeamsDrawer | null>(null);
  const [bulkOutcome, setBulkOutcome] = useState<BulkDeleteOutcome | null>(null);

  const teams = teamsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = teamsQuery.data?.pages[0]?.metadata.total ?? teams.length;
  const isEmpty = teamsQuery.isSuccess && teams.length === 0;

  // A new filter, sort or page size restarts the list, so a selection would point at rows
  // that are no longer shown.
  const handleFilterChange = (name: TeamFilterName, value: string) => {
    setSelectedIds(new Set());
    setFilter(name, value);
  };

  const handleClearFilters = () => {
    setSelectedIds(new Set());
    clearFilters();
    setToolbarKey((key) => {
      return key + 1;
    });
  };

  const handleToggle = (teamId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }

      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(teams.map((team) => team.id)) : new Set());
  };

  const handleBulkDeleted = (outcome: BulkDeleteOutcome) => {
    setBulkOutcome(outcome);
    // Failed rows stay selected, so trying again is one click.
    setSelectedIds(new Set(outcome.failures.map((failure) => failure.id)));
    setDrawer(null);
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  const handleDelete = canDelete
    ? (team: Team) => {
        setDrawer({ kind: 'delete', team });
      }
    : undefined;

  const rowsProps = {
    teams,
    divisionId: params.division_id,
    selectedIds,
    onToggle: handleToggle,
    onToggleAll: handleToggleAll,
    onDelete: handleDelete,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <PageTitle>{t('admin.teamsTitle')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('teams.list.subtitle')}</p>
        </div>
        {canCreate && (
          <Button
            disabled={teamsQuery.isPending}
            onClick={() => {
              setDrawer({ kind: 'create' });
            }}
          >
            <Plus aria-hidden />
            {t('teams.create.open')}
          </Button>
        )}
      </div>

      {bulkOutcome !== null && (
        <BulkDeleteResult
          outcome={bulkOutcome}
          onDismiss={() => {
            setBulkOutcome(null);
          }}
        />
      )}

      <TeamsToolbar
        key={toolbarKey}
        params={params}
        disabled={teamsQuery.isPending}
        onFilterChange={handleFilterChange}
      />

      {selectedIds.size > 0 && (
        <BulkDeleteBar
          selectedCount={selectedIds.size}
          onClear={() => {
            setSelectedIds(new Set());
          }}
          onDelete={() => {
            setDrawer({ kind: 'bulkDelete' });
          }}
        />
      )}

      {teamsQuery.isPending && <TeamsTableSkeleton />}

      {teamsQuery.isError && teamsQuery.data === undefined && (
        <EmptyState
          icon={TriangleAlert}
          title={t('teams.list.errorTitle')}
          body={t('teams.list.errorBody')}
          action={
            <Button
              variant="outline"
              onClick={() => {
                void teamsQuery.refetch();
              }}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}

      {isEmpty && !hasFilters && (
        <EmptyState
          icon={Shield}
          title={t('teams.list.emptyTitle')}
          body={t('teams.list.emptyBody')}
          action={
            canCreate ? (
              <Button
                onClick={() => {
                  setDrawer({ kind: 'create' });
                }}
              >
                {t('teams.create.open')}
              </Button>
            ) : undefined
          }
        />
      )}

      {isEmpty && hasFilters && (
        <EmptyState
          icon={Search}
          title={t('teams.list.noMatchesTitle')}
          body={t('teams.list.noMatchesBody')}
          action={
            <Button variant="outline" onClick={handleClearFilters}>
              {t('teams.filters.clear')}
            </Button>
          }
        />
      )}

      {teams.length > 0 && (
        <>
          <ScrollableTable
            hasMore={teamsQuery.hasNextPage && !teamsQuery.isFetchNextPageError}
            isLoadingMore={teamsQuery.isFetchingNextPage}
            onLoadMore={() => {
              void teamsQuery.fetchNextPage();
            }}
          >
            {isMobile ? <TeamCards {...rowsProps} /> : <TeamsTable {...rowsProps} />}
          </ScrollableTable>
          {teamsQuery.isFetchNextPageError && (
            <ErrorBanner
              error={teamsQuery.error}
              onRetry={() => {
                void teamsQuery.fetchNextPage();
              }}
            />
          )}
          <LoadMoreFooter
            summary={t('teams.list.showing', { shown: teams.length, total })}
            pageSize={params.limit}
            hasMore={teamsQuery.hasNextPage}
            endLabel={t('teams.list.allLoaded', { count: total })}
            onPageSizeChange={(pageSize) => {
              handleFilterChange('limit', String(pageSize));
            }}
          />
        </>
      )}

      {drawer?.kind === 'create' && (
        <CreateTeamDrawer defaultDivisionId={params.division_id} onClose={closeDrawer} />
      )}
      {drawer?.kind === 'delete' && (
        <DeleteTeamDrawer team={drawer.team} onClose={closeDrawer} onDeleted={closeDrawer} />
      )}
      {drawer?.kind === 'bulkDelete' && (
        <BulkDeleteDrawer
          teams={teams.filter((team) => selectedIds.has(team.id))}
          onClose={closeDrawer}
          onDeleted={handleBulkDeleted}
        />
      )}
    </div>
  );
};
