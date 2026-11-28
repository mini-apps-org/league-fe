import { describe, expect, it } from 'vitest';

import type { DivisionOption } from '@/types/divisions';
import type { VenueOption } from '@/types/league';

import { getDivisionGroups, getVenueGroups } from './lookup-groups';

const division = (
  id: string,
  name: string,
  session: { id: string; name: string },
): DivisionOption => {
  return { id, name, session_id: session.id, session_name: session.name };
};

const FALL = { id: 'session-fall', name: 'Fall 2026' };
const SPRING = { id: 'session-spring', name: 'Spring 2026' };

describe('getDivisionGroups', () => {
  it('groups divisions under their session, keeping the order the server sent', () => {
    const groups = getDivisionGroups([
      division('fall-8', '8-Ball Open', FALL),
      division('spring-8', '8-Ball Open', SPRING),
      division('fall-9', '9-Ball Masters', FALL),
    ]);

    expect(groups).toEqual([
      {
        id: 'session-fall',
        label: 'Fall 2026',
        options: [
          { value: 'fall-8', label: '8-Ball Open' },
          { value: 'fall-9', label: '9-Ball Masters' },
        ],
      },
      {
        id: 'session-spring',
        label: 'Spring 2026',
        options: [{ value: 'spring-8', label: '8-Ball Open' }],
      },
    ]);
  });

  // Two sessions can share a name; the id is what makes them different groups.
  it('keeps sessions apart by id, not by name', () => {
    const groups = getDivisionGroups([
      division('a', '8-Ball Open', { id: 'session-1', name: 'Fall 2026' }),
      division('b', '8-Ball Open', { id: 'session-2', name: 'Fall 2026' }),
    ]);

    expect(groups).toHaveLength(2);
  });

  it('returns no groups for no divisions', () => {
    expect(getDivisionGroups([])).toEqual([]);
  });
});

describe('getVenueGroups', () => {
  it('lists every venue in one group without a heading', () => {
    const venues: VenueOption[] = [
      { id: 'venue-1', name: 'Downtown Billiards' },
      { id: 'venue-2', name: 'Riverside Hall' },
    ];

    expect(getVenueGroups(venues)).toEqual([
      {
        id: 'venues',
        options: [
          { value: 'venue-1', label: 'Downtown Billiards' },
          { value: 'venue-2', label: 'Riverside Hall' },
        ],
      },
    ]);
  });

  // One empty group, so the select still has a group to render and shows its empty label.
  it('returns one empty group for no venues', () => {
    expect(getVenueGroups([])).toEqual([{ id: 'venues', options: [] }]);
  });
});
