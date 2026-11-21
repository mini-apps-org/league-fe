import { cn } from 'cn';
import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SKELETON_ROWS = 5;
// One bar per column, at the widths the design draws for a loading row.
const CELL_WIDTHS = ['w-35', 'w-15', 'w-10', 'w-42', 'w-20', 'w-12', 'w-15'] as const;

export const SessionTableSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Table aria-busy="true">
      <TableHeader className="max-md:hidden">
        <TableRow className="bg-muted hover:bg-muted">
          <TableHead>{t('admin.sessions.columns.name')}</TableHead>
          <TableHead>{t('admin.sessions.columns.type')}</TableHead>
          <TableHead>{t('admin.sessions.columns.year')}</TableHead>
          <TableHead>{t('admin.sessions.columns.dates')}</TableHead>
          <TableHead>{t('admin.sessions.columns.status')}</TableHead>
          <TableHead>{t('admin.sessions.columns.active')}</TableHead>
          <TableHead>
            <span className="sr-only">{t('admin.sessions.columns.actions')}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: SKELETON_ROWS }, (_, row) => {
          return (
            <TableRow key={row} className="hover:bg-transparent">
              {CELL_WIDTHS.map((width) => (
                <TableCell key={width}>
                  <Skeleton className={cn('h-3', width)} />
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
