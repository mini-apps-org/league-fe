import type { LookupGroup } from '@/lib/lookups';
import type { DivisionOption } from '@/types/divisions';
import type { VenueOption } from '@/types/league';

// Venues come as one flat list, so their single group needs a fixed id of its own.
const VENUE_GROUP_ID = 'venues';

// One group per session, in the order the server lists them, since a division's name only
// means something inside its session: every session can have an "8-Ball Open".
export const getDivisionGroups = (divisions: DivisionOption[]): LookupGroup[] => {
  const groups = new Map<string, LookupGroup>();

  for (const division of divisions) {
    const group = groups.get(division.session_id) ?? {
      id: division.session_id,
      label: division.session_name,
      options: [],
    };
    group.options.push({ value: division.id, label: division.name });
    groups.set(division.session_id, group);
  }

  return [...groups.values()];
};

export const getVenueGroups = (venues: VenueOption[]): LookupGroup[] => {
  return [
    {
      id: VENUE_GROUP_ID,
      options: venues.map((venue) => ({ value: venue.id, label: venue.name })),
    },
  ];
};
