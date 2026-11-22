import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from '@/lib/icons';
import type { SessionFilters } from '@/types/league';

type FilterKey = 'q' | 'sessionType' | 'seasonYear' | 'status';

interface FilterChip {
  key: FilterKey;
  label: string;
}

interface SessionFilterChipsProps {
  filters: SessionFilters;
  onFiltersChange: (changes: Partial<SessionFilters>) => void;
  onClearFilters: () => void;
}

export const SessionFilterChips = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: SessionFilterChipsProps) => {
  const { t } = useTranslation();
  const chips: FilterChip[] = [];

  if (filters.q !== undefined) {
    chips.push({ key: 'q', label: t('admin.sessions.chips.name', { q: filters.q }) });
  }
  if (filters.sessionType !== undefined) {
    chips.push({ key: 'sessionType', label: t(`admin.sessions.type.${filters.sessionType}`) });
  }
  if (filters.seasonYear !== undefined) {
    chips.push({ key: 'seasonYear', label: String(filters.seasonYear) });
  }
  if (filters.status !== undefined) {
    chips.push({ key: 'status', label: t(`admin.sessions.status.${filters.status}`) });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label={t('admin.sessions.chips.label')}
      className="flex flex-wrap items-center gap-1.5"
    >
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-0.5">
          {chip.label}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t('admin.sessions.chips.remove', { label: chip.label })}
            onClick={() => {
              onFiltersChange({ [chip.key]: undefined });
            }}
          >
            <X aria-hidden />
          </Button>
        </Badge>
      ))}
      <Button variant="link" size="sm" onClick={onClearFilters}>
        {t('admin.sessions.chips.clearAll')}
      </Button>
    </div>
  );
};
