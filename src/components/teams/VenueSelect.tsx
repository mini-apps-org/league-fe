import { useTranslation } from 'react-i18next';

import { LookupSelect, type LookupSelectProps } from '@/components/league/LookupSelect';
import { useVenueOptions } from '@/hooks/useTeams';
import { getVenueGroups } from '@/lib/lookup-groups';

export const VenueSelect = (props: LookupSelectProps) => {
  const { t } = useTranslation();
  const venuesQuery = useVenueOptions();

  return (
    <LookupSelect
      {...props}
      groups={getVenueGroups(venuesQuery.data ?? [])}
      status={venuesQuery.status}
      placeholder={t('teams.lookup.venuePlaceholder')}
      emptyLabel={t('teams.lookup.noVenues')}
    />
  );
};
