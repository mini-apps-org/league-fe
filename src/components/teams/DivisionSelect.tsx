import { useTranslation } from 'react-i18next';

import { LookupSelect, type LookupSelectProps } from '@/components/league/LookupSelect';
import { useDivisionOptions } from '@/hooks/useDivisions';
import { getDivisionGroups } from '@/lib/lookup-groups';

// Every division, grouped under its session.
export const DivisionSelect = (props: LookupSelectProps) => {
  const { t } = useTranslation();
  const divisionsQuery = useDivisionOptions();

  return (
    <LookupSelect
      {...props}
      groups={getDivisionGroups(divisionsQuery.data ?? [])}
      status={divisionsQuery.status}
      placeholder={t('teams.lookup.divisionPlaceholder')}
      emptyLabel={t('teams.lookup.noDivisions')}
    />
  );
};
