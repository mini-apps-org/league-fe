import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DivisionSelect } from '@/components/teams/DivisionSelect';
import { IdFilterInput } from '@/components/teams/IdFilterInput';
import { VenueSelect } from '@/components/teams/VenueSelect';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TeamFilterName } from '@/hooks/useTeamFilters';
import { TEAM_SORTS } from '@/hooks/useTeamFilters';
import { Search } from '@/lib/icons';
import type { TeamListParams } from '@/types/teams';

const SEARCH_DEBOUNCE_MS = 300;

interface TeamsToolbarProps {
  params: Required<TeamListParams>;
  disabled: boolean;
  onFilterChange: (name: TeamFilterName, value: string) => void;
}

// Mount with a new `key` to clear it: the inputs hold what the user is typing, the URL holds
// what was applied.
export const TeamsToolbar = ({ params, disabled, onFilterChange }: TeamsToolbarProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(params.q);
  const searchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.clearTimeout(searchTimer.current);
    };
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      onFilterChange('q', value.trim());
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          className="pl-9"
          value={query}
          disabled={disabled}
          placeholder={t('teams.filters.search')}
          aria-label={t('teams.filters.search')}
          onChange={(event) => {
            handleQueryChange(event.target.value);
          }}
        />
      </div>
      <DivisionSelect
        value={params.division_id}
        noneLabel={t('teams.lookup.allDivisions')}
        ariaLabel={t('teams.lookup.division')}
        isDisabled={disabled}
        fallback={
          <IdFilterInput
            label={t('teams.filters.divisionId')}
            initialValue={params.division_id}
            disabled={disabled}
            onApply={(value) => {
              onFilterChange('division_id', value);
            }}
          />
        }
        onValueChange={(value) => {
          onFilterChange('division_id', value);
        }}
      />
      <VenueSelect
        value={params.venue_id}
        noneLabel={t('teams.lookup.allVenues')}
        ariaLabel={t('teams.lookup.venue')}
        isDisabled={disabled}
        fallback={
          <IdFilterInput
            label={t('teams.filters.venueId')}
            initialValue={params.venue_id}
            disabled={disabled}
            onApply={(value) => {
              onFilterChange('venue_id', value);
            }}
          />
        }
        onValueChange={(value) => {
          onFilterChange('venue_id', value);
        }}
      />
      <Select
        value={params.sort}
        disabled={disabled}
        onValueChange={(value) => {
          onFilterChange('sort', value);
        }}
      >
        <SelectTrigger className="w-full" aria-label={t('teams.filters.sort')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TEAM_SORTS.map((sort) => (
            <SelectItem key={sort} value={sort}>
              {t(`teams.sort.${sort}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
