import { cn } from 'cn';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link, useNavigate } from 'react-router';

import { SessionStatusBadge } from '@/components/league/SessionStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateRange } from '@/lib/format';
import { ChevronDown, ChevronsUpDown, ChevronUp, Pencil, Trash2 } from '@/lib/icons';
import {
  getColumnSortDirection,
  getNextColumnSort,
  type SessionSortColumn,
  type SessionSortOption,
} from '@/lib/session-filters';
import type { LeagueSession } from '@/types/league';
import { ROUTES } from '@/utils';

const SORT_ICON = {
  ascending: ChevronUp,
  descending: ChevronDown,
  none: ChevronsUpDown,
} as const;

// Below md the table turns into stacked rows: name, dates and active on the left; status and
// the actions on the right. Type and year hide, as in the design.
const MOBILE_ROW =
  'max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-x-3 max-md:gap-y-1 max-md:px-4 max-md:py-3.5';
const MOBILE_CELL = 'max-md:p-0';

interface SortableHeadProps {
  label: string;
  column: SessionSortColumn;
  sort: SessionSortOption;
  onSortChange: (sort: SessionSortOption) => void;
}

const SortableHead = ({ label, column, sort, onSortChange }: SortableHeadProps) => {
  const direction = getColumnSortDirection(sort, column);
  const Icon = SORT_ICON[direction ?? 'none'];

  return (
    <TableHead aria-sort={direction}>
      <button
        type="button"
        className={cn('inline-flex items-center gap-1', direction && 'text-foreground')}
        onClick={() => {
          onSortChange(getNextColumnSort(sort, column));
        }}
      >
        {label}
        <Icon className="size-3" aria-hidden />
      </button>
    </TableHead>
  );
};

interface SessionTableProps {
  sessions: LeagueSession[];
  totalCount: number;
  sort: SessionSortOption;
  onSortChange: (sort: SessionSortOption) => void;
  onEdit: (session: LeagueSession) => void;
  onDelete: (session: LeagueSession) => void;
}

export const SessionTable = ({
  sessions,
  totalCount,
  sort,
  onSortChange,
  onEdit,
  onDelete,
}: SessionTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sessionPath = (session: LeagueSession): string => {
    return generatePath(ROUTES.ADMIN_SESSION, { sessionId: session.id });
  };

  // The row's own click opens the session, so the controls inside it must not bubble up.
  const stopRowClick = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  return (
    <>
      <Table>
        <TableHeader className="max-md:hidden">
          <TableRow className="bg-muted hover:bg-muted">
            <SortableHead
              label={t('admin.sessions.columns.name')}
              column="name"
              sort={sort}
              onSortChange={onSortChange}
            />
            <TableHead>{t('admin.sessions.columns.type')}</TableHead>
            <SortableHead
              label={t('admin.sessions.columns.year')}
              column="season_year"
              sort={sort}
              onSortChange={onSortChange}
            />
            <SortableHead
              label={t('admin.sessions.columns.dates')}
              column="starts_on"
              sort={sort}
              onSortChange={onSortChange}
            />
            <TableHead>{t('admin.sessions.columns.status')}</TableHead>
            <TableHead>{t('admin.sessions.columns.active')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('admin.sessions.columns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            // The name is the keyboard path; clicking anywhere else on the row is a shortcut.
            <TableRow
              key={session.id}
              className={cn('cursor-pointer', MOBILE_ROW)}
              onClick={() => {
                void navigate(sessionPath(session));
              }}
            >
              <TableCell className={cn(MOBILE_CELL, 'max-md:col-start-1')}>
                <Link
                  to={sessionPath(session)}
                  className="font-semibold hover:underline"
                  onClick={stopRowClick}
                >
                  {session.name}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {session.weekCount > 0
                    ? t('admin.sessions.weeksScheduled', { count: session.weekCount })
                    : t('admin.sessions.noWeeks')}
                </span>
              </TableCell>
              <TableCell className="max-md:hidden">
                {t(`admin.sessions.type.${session.sessionType}`)}
              </TableCell>
              <TableCell className="tabular max-md:hidden">{session.seasonYear}</TableCell>
              <TableCell className={cn(MOBILE_CELL, 'text-muted-foreground max-md:col-start-1')}>
                {formatDateRange(session.startsOn, session.endsOn)}
              </TableCell>
              <TableCell
                className={cn(
                  MOBILE_CELL,
                  'max-md:col-start-2 max-md:row-start-1 max-md:justify-self-end',
                )}
              >
                <SessionStatusBadge status={session.status} />
              </TableCell>
              <TableCell className={cn(MOBILE_CELL, 'max-md:col-start-1')}>
                {session.isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span aria-hidden className="size-2 rounded-full bg-primary" />
                    {t('admin.sessions.active')}
                  </span>
                ) : (
                  <span className="text-muted-foreground max-md:hidden">
                    <span aria-hidden>—</span>
                    <span className="sr-only">{t('admin.sessions.inactive')}</span>
                  </span>
                )}
              </TableCell>
              <TableCell
                className={cn(
                  MOBILE_CELL,
                  'max-md:col-start-2 max-md:row-span-2 max-md:row-start-2 max-md:self-center',
                )}
              >
                <div className="flex justify-end gap-0.5">
                  <PermissionGate required="session.update">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('admin.sessions.editSession', { name: session.name })}
                      onClick={(event) => {
                        stopRowClick(event);
                        onEdit(session);
                      }}
                    >
                      <Pencil aria-hidden />
                    </Button>
                  </PermissionGate>
                  <PermissionGate required="session.delete">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('admin.sessions.deleteSession', { name: session.name })}
                      onClick={(event) => {
                        stopRowClick(event);
                        onDelete(session);
                      }}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </PermissionGate>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span className="tabular">
          {t('admin.sessions.footer.showing', { shown: sessions.length, total: totalCount })}
        </span>
        <span className="max-md:hidden">{t('admin.sessions.footer.rowHint')}</span>
      </div>
    </>
  );
};
