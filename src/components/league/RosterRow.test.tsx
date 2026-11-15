import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { i18next } from '@/i18n';
import { renderWithProviders } from '@/test/render';
import type { RosterPlayer } from '@/types/league';

import { RosterRow } from './RosterRow';

const PLAYER: RosterPlayer = {
  playerId: 'p1',
  memberId: '95007620',
  fullName: 'Le Minh Quan',
  skillLevel: 7,
  isPaid: true,
  matchesPlayed: 5,
  matchesWon: 3,
  totalPoints: 7,
};

function renderRow(player: RosterPlayer, selection?: 'none' | 'selected') {
  return renderWithProviders(
    <ul>
      <RosterRow player={player} selection={selection} />
    </ul>,
  );
}

describe('RosterRow', () => {
  it('shows the record as won over played', () => {
    renderRow(PLAYER);

    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('flags an unpaid player', () => {
    renderRow({ ...PLAYER, isPaid: false });

    expect(screen.getByText(new RegExp(i18next.t('roster.unpaid')))).toBeInTheDocument();
  });

  it('marks only the selected row as current', () => {
    const { unmount } = renderRow(PLAYER, 'selected');
    expect(screen.getByRole('listitem')).toHaveAttribute('aria-current', 'true');

    unmount();
    renderRow(PLAYER);
    expect(screen.getByRole('listitem')).not.toHaveAttribute('aria-current');
  });
});
