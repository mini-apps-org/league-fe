import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface BulkDeleteBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
}

// Sticks to the bottom of the screen on phones, where the toolbar has scrolled away.
export const BulkDeleteBar = ({ selectedCount, onClear, onDelete }: BulkDeleteBarProps) => {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t('teams.bulk.region')}
      className="flex flex-wrap items-center gap-3 rounded-card border border-primary bg-primary-soft px-4 py-2 max-md:sticky max-md:bottom-[max(1rem,env(safe-area-inset-bottom))] max-md:z-10"
    >
      <span className="flex-1 text-sm font-medium">
        {t('teams.bulk.selected', { count: selectedCount })}
      </span>
      <Button variant="ghost" onClick={onClear}>
        {t('teams.bulk.clear')}
      </Button>
      <Button variant="destructive" onClick={onDelete}>
        {t('teams.bulk.delete', { count: selectedCount })}
      </Button>
    </div>
  );
};
