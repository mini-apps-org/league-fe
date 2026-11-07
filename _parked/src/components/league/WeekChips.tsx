import { useTranslation } from 'react-i18next';

import { cn } from 'cn';

interface WeekChipsProps {
  weeks: readonly number[];
  selected: number | null;
  onSelect: (week: number) => void;
}

export default function WeekChips({ weeks, selected, onSelect }: WeekChipsProps) {
  const { t } = useTranslation();

  return (
    // Bleeds to the screen edge so the row reads as scrollable rather than clipped.
    <div
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1"
      role="group"
      aria-label={t('schedule.weeks')}
    >
      {weeks.map((week) => {
        const isSelected = week === selected;

        return (
          <button
            key={week}
            type="button"
            aria-pressed={isSelected}
            onClick={() => {
              onSelect(week);
            }}
            className={cn(
              'tabular h-9 shrink-0 snap-start rounded-chip px-4 text-sm',
              isSelected ? 'bg-accent font-medium text-accent-foreground' : 'bg-chip text-text-2',
            )}
          >
            {t('schedule.weekShort', { n: week })}
          </button>
        );
      })}
    </div>
  );
}
