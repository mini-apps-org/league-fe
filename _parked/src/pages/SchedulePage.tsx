import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/league/EmptyState';
import ErrorBanner from '@/components/league/ErrorBanner';
import FixtureCard from '@/components/league/FixtureCard';
import WeekChips from '@/components/league/WeekChips';
import { Skeleton } from '@/components/ui/skeleton';
import { useDivisions, useFixtures, useSeasons } from '@/hooks/useLeague';
import { CalendarOff } from '@/lib/icons';
import type { TeamMatchSummary } from '@/types/league';

function weeksOf(fixtures: readonly TeamMatchSummary[]): number[] {
  return [...new Set(fixtures.map((fixture) => fixture.weekNo))].sort((a, b) => a - b);
}

// The week a captain most likely wants: the earliest one still to be played, falling back to
// the last week of the season once everything is submitted.
function currentWeek(fixtures: readonly TeamMatchSummary[]): number | null {
  const weeks = weeksOf(fixtures);

  if (weeks.length === 0) {
    return null;
  }

  const earliestUnfinished = fixtures
    .filter((fixture) => fixture.status !== 'submitted')
    .map((fixture) => fixture.weekNo)
    .sort((a, b) => a - b)[0];

  if (earliestUnfinished !== undefined) {
    return earliestUnfinished;
  }

  return weeks[weeks.length - 1] ?? null;
}

export default function SchedulePage() {
  const { t } = useTranslation();

  const seasons = useSeasons();
  const activeSeason = seasons.data?.find((season) => season.isActive) ?? seasons.data?.[0];

  const divisions = useDivisions(activeSeason?.id);
  // Local override on top of server data, per the React rules: no copying query data into
  // state, and no effect to sync a default.
  const [chosenDivisionId, setChosenDivisionId] = useState<string | null>(null);
  const divisionId = chosenDivisionId ?? divisions.data?.[0]?.id;

  const fixtures = useFixtures(divisionId);
  const allFixtures = fixtures.data ?? [];

  const [chosenWeek, setChosenWeek] = useState<number | null>(null);
  const selectedWeek = chosenWeek ?? currentWeek(allFixtures);
  const weekFixtures = allFixtures.filter((fixture) => fixture.weekNo === selectedWeek);

  const error = seasons.error ?? divisions.error ?? fixtures.error;
  const isLoading = seasons.isPending || divisions.isPending || fixtures.isPending;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('schedule.title')}</h1>

      {error !== null && error !== undefined && (
        <ErrorBanner
          error={error}
          onRetry={() => {
            void seasons.refetch();
            void divisions.refetch();
            void fixtures.refetch();
          }}
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-9 w-2/3 rounded-chip" />
          <Skeleton className="h-[88px] w-full rounded-card" />
          <Skeleton className="h-[88px] w-full rounded-card" />
          <Skeleton className="h-[88px] w-full rounded-card" />
        </div>
      )}

      {!isLoading && activeSeason === undefined && (
        <EmptyState
          icon={CalendarOff}
          title={t('schedule.noSessionTitle')}
          body={t('schedule.noSessionBody')}
        />
      )}

      {!isLoading && activeSeason !== undefined && (
        <>
          {/* A native select: on a phone this is the platform picker, which beats any
              custom listbox for reach and assistive-tech support. */}
          <label className="block">
            <span className="sr-only">{t('schedule.session')}</span>
            <select
              value={divisionId ?? ''}
              onChange={(event) => {
                setChosenDivisionId(event.target.value);
                setChosenWeek(null);
              }}
              className="h-11 w-full rounded-lg border border-input-line bg-chip px-3 text-base"
            >
              {(divisions.data ?? []).map((division) => {
                return (
                  <option key={division.id} value={division.id}>
                    {`${activeSeason.name} · ${division.name}`}
                  </option>
                );
              })}
            </select>
          </label>

          <WeekChips
            weeks={weeksOf(allFixtures)}
            selected={selectedWeek}
            onSelect={setChosenWeek}
          />

          {weekFixtures.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title={t('schedule.emptyTitle')}
              body={t('schedule.emptyBody')}
            />
          ) : (
            <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {weekFixtures.map((fixture) => {
                return (
                  <li key={fixture.id}>
                    <FixtureCard fixture={fixture} />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
