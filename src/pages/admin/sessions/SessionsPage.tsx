import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorCodeChip } from '@/components/ErrorCodeChip';
import { PageTitle } from '@/components/PageTitle';
import { PermissionGate } from '@/components/PermissionGate';
import { StateCard } from '@/components/StateCard';
import { Button } from '@/components/ui/button';
import { useSessions } from '@/hooks/useLeagueQueries';
import { useSessionFilters } from '@/hooks/useSessionFilters';
import { messageFor } from '@/lib/errors';
import { CalendarRange, Funnel, Plus, TriangleAlert } from '@/lib/icons';
import {
  ALL_SESSIONS,
  DEFAULT_SESSION_SORT,
  getSeasonYears,
  hasSessionFilters,
} from '@/lib/session-filters';
import type { LeagueSession } from '@/types/league';

import { DeleteSessionDrawer } from './DeleteSessionDrawer';
import { SessionFilterChips } from './SessionFilterChips';
import { SessionFormDrawer } from './SessionFormDrawer';
import { SessionStats } from './SessionStats';
import { SessionsToolbar } from './SessionsToolbar';
import { SessionTable } from './SessionTable';
import { SessionTableSkeleton } from './SessionTableSkeleton';

// The session stays set while a drawer closes, so its content doesn't change mid-animation.
interface DrawerTarget {
  isOpen: boolean;
  session: LeagueSession | null;
}

const CLOSED: DrawerTarget = { isOpen: false, session: null };

export const SessionsPage = () => {
  const { t } = useTranslation();
  const { filters, updateFilters, clearFilters } = useSessionFilters();
  const sessions = useSessions(filters);
  const allSessions = useSessions(ALL_SESSIONS);
  const [formTarget, setFormTarget] = useState<DrawerTarget>(CLOSED);
  const [deleteTarget, setDeleteTarget] = useState<DrawerTarget>(CLOSED);
  const totalCount = allSessions.data?.length ?? 0;
  const hasNoSessions =
    sessions.isSuccess && sessions.data.length === 0 && !hasSessionFilters(filters);

  const openCreate = (): void => {
    setFormTarget({ isOpen: true, session: null });
  };

  const newSessionButton = (
    <PermissionGate required="session.create">
      <Button onClick={openCreate}>
        <Plus aria-hidden />
        {t('admin.sessions.new')}
      </Button>
    </PermissionGate>
  );

  const renderList = () => {
    if (sessions.isPending) {
      return <SessionTableSkeleton />;
    }

    if (sessions.isError) {
      return (
        <StateCard
          bordered={false}
          tone="destructive"
          icon={TriangleAlert}
          title={t('admin.sessions.states.errorTitle')}
          body={
            <>
              {messageFor(sessions.error)} <ErrorCodeChip error={sessions.error} />
            </>
          }
          action={
            <Button
              variant="outline"
              onClick={() => {
                void sessions.refetch();
              }}
            >
              {t('admin.sessions.states.retry')}
            </Button>
          }
        />
      );
    }

    if (hasNoSessions) {
      return (
        <StateCard
          bordered={false}
          tone="highlight"
          icon={CalendarRange}
          title={t('admin.sessions.states.emptyTitle')}
          body={t('admin.sessions.states.emptyBody')}
          action={newSessionButton}
        />
      );
    }

    if (sessions.data.length === 0) {
      return (
        <StateCard
          bordered={false}
          icon={Funnel}
          title={t('admin.sessions.states.filteredTitle')}
          body={t('admin.sessions.states.filteredBody', { count: totalCount })}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t('admin.sessions.clearFilters')}
            </Button>
          }
        />
      );
    }

    return (
      <SessionTable
        sessions={sessions.data}
        totalCount={totalCount}
        sort={filters.sort ?? DEFAULT_SESSION_SORT}
        onSortChange={(sort) => {
          updateFilters({ sort });
        }}
        onEdit={(session) => {
          setFormTarget({ isOpen: true, session });
        }}
        onDelete={(session) => {
          setDeleteTarget({ isOpen: true, session });
        }}
      />
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle description={t('admin.sessions.description')}>
          {t('admin.sessions.title')}
        </PageTitle>
        {newSessionButton}
      </div>

      {sessions.isSuccess && !hasNoSessions && allSessions.data !== undefined && (
        <SessionStats sessions={allSessions.data} />
      )}

      <SessionsToolbar
        filters={filters}
        seasonYears={getSeasonYears(allSessions.data ?? [])}
        isDisabled={!sessions.isSuccess || hasNoSessions}
        onFiltersChange={updateFilters}
      />
      <SessionFilterChips
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      <div className="overflow-hidden rounded-card border bg-card">{renderList()}</div>

      <SessionFormDrawer
        open={formTarget.isOpen}
        session={formTarget.session ?? undefined}
        onOpenChange={(isOpen) => {
          setFormTarget((current) => {
            return { ...current, isOpen };
          });
        }}
      />
      <DeleteSessionDrawer
        open={deleteTarget.isOpen}
        session={deleteTarget.session}
        onOpenChange={(isOpen) => {
          setDeleteTarget((current) => {
            return { ...current, isOpen };
          });
        }}
      />
    </div>
  );
};
