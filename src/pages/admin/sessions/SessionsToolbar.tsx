import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Search } from '@/lib/icons';
import {
  SESSION_SORTS,
  SESSION_STATUSES,
  SESSION_TYPES,
  type SessionSortOption,
} from '@/lib/session-filters';
import type { SessionFilters, SessionStatus, SessionType } from '@/types/league';

const SEARCH_DEBOUNCE_MS = 300;
// Radix Select cannot hold an empty value, so "no filter" needs a value of its own.
const ALL = 'all';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  isDisabled: boolean;
  onValueChange: (value: string) => void;
}

const FilterSelect = ({ label, value, options, isDisabled, onValueChange }: FilterSelectProps) => {
  return (
    <Select value={value} disabled={isDisabled} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className="min-w-32 max-md:flex-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const pickOption = <T extends string>(value: string, allowed: readonly T[]): T | undefined => {
  return allowed.find((candidate) => candidate === value);
};

interface SessionsToolbarProps {
  filters: SessionFilters;
  seasonYears: number[];
  isDisabled: boolean;
  onFiltersChange: (changes: Partial<SessionFilters>) => void;
}

export const SessionsToolbar = ({
  filters,
  seasonYears,
  isDisabled,
  onFiltersChange,
}: SessionsToolbarProps) => {
  const { t } = useTranslation();
  // What the user is typing, until the debounce writes it to the URL. Null means "show the
  // URL's value", so Back and the filter chips are reflected without syncing state.
  const [searchDraft, setSearchDraft] = useState<string | null>(null);
  const writeSearch = useDebouncedCallback<string>((q) => {
    onFiltersChange({ q: q.trim() === '' ? undefined : q.trim() });
    setSearchDraft(null);
  }, SEARCH_DEBOUNCE_MS);

  const typeOptions: FilterOption[] = [
    { value: ALL, label: t('admin.sessions.filters.allTypes') },
    ...SESSION_TYPES.map((type) => ({ value: type, label: t(`admin.sessions.type.${type}`) })),
  ];
  const yearOptions: FilterOption[] = [
    { value: ALL, label: t('admin.sessions.filters.allYears') },
    ...seasonYears.map((year) => ({ value: String(year), label: String(year) })),
  ];
  const statusOptions: FilterOption[] = [
    { value: ALL, label: t('admin.sessions.filters.allStatuses') },
    ...SESSION_STATUSES.map((status) => ({
      value: status,
      label: t(`admin.sessions.status.${status}`),
    })),
  ];
  const sortOptions: FilterOption[] = SESSION_SORTS.map((sort) => ({
    value: sort,
    label: t(`admin.sessions.sort.${sort}`),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-0 flex-1 basis-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          className="pl-8"
          aria-label={t('admin.sessions.searchPlaceholder')}
          placeholder={t('admin.sessions.searchPlaceholder')}
          disabled={isDisabled}
          value={searchDraft ?? filters.q ?? ''}
          onChange={(event) => {
            setSearchDraft(event.target.value);
            writeSearch.schedule(event.target.value);
          }}
        />
      </div>

      <FilterSelect
        label={t('admin.sessions.filters.type')}
        value={filters.sessionType ?? ALL}
        options={typeOptions}
        isDisabled={isDisabled}
        onValueChange={(value) => {
          onFiltersChange({ sessionType: pickOption<SessionType>(value, SESSION_TYPES) });
        }}
      />
      <FilterSelect
        label={t('admin.sessions.filters.year')}
        value={filters.seasonYear === undefined ? ALL : String(filters.seasonYear)}
        options={yearOptions}
        isDisabled={isDisabled}
        onValueChange={(value) => {
          onFiltersChange({ seasonYear: value === ALL ? undefined : Number(value) });
        }}
      />
      <FilterSelect
        label={t('admin.sessions.filters.status')}
        value={filters.status ?? ALL}
        options={statusOptions}
        isDisabled={isDisabled}
        onValueChange={(value) => {
          onFiltersChange({ status: pickOption<SessionStatus>(value, SESSION_STATUSES) });
        }}
      />
      <FilterSelect
        label={t('admin.sessions.filters.sort')}
        value={filters.sort ?? SESSION_SORTS[0]}
        options={sortOptions}
        isDisabled={isDisabled}
        onValueChange={(value) => {
          onFiltersChange({ sort: pickOption<SessionSortOption>(value, SESSION_SORTS) });
        }}
      />
    </div>
  );
};
