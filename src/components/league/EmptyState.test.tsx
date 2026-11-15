import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/button';
import { i18next } from '@/i18n';
import { CalendarOff } from '@/lib/icons';
import { renderWithProviders } from '@/test/render';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and body without an action by default', () => {
    renderWithProviders(
      <EmptyState
        icon={CalendarOff}
        title={i18next.t('schedule.emptyTitle')}
        body={i18next.t('schedule.emptyBody')}
      />,
    );

    expect(screen.getByText(i18next.t('schedule.emptyTitle'))).toBeInTheDocument();
    expect(screen.getByText(i18next.t('schedule.emptyBody'))).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the action when one is given', () => {
    renderWithProviders(
      <EmptyState
        icon={CalendarOff}
        title={i18next.t('roster.emptyTitle')}
        action={<Button>{i18next.t('roster.addPaidMember')}</Button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: i18next.t('roster.addPaidMember') }),
    ).toBeInTheDocument();
  });
});
