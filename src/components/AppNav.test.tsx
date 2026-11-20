import { screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import { renderWithProviders } from '@/test/render';
import { ROUTES } from '@/utils';

import { AppNav } from './AppNav';

const renderNav = (route: string) => {
  return renderWithProviders(
    <SidebarProvider>
      <AppNav />
    </SidebarProvider>,
    { route },
  );
};

describe('AppNav', () => {
  it('marks only the current page as active', () => {
    renderNav(ROUTES.ADMIN_PLAYERS);

    const players = screen.getByRole('link', { name: i18next.t('nav.players') });
    const schedule = screen.getByRole('link', { name: i18next.t('nav.schedule') });

    expect(players).toHaveAttribute('aria-current', 'page');
    expect(players).toHaveAttribute('data-active', 'true');
    expect(schedule).not.toHaveAttribute('aria-current');
    expect(schedule).not.toHaveAttribute('data-active');
  });

  it('keeps the schedule link active only on the home route', () => {
    renderNav(ROUTES.HOME);

    const schedule = screen.getByRole('link', { name: i18next.t('nav.schedule') });

    expect(schedule).toHaveAttribute('data-active', 'true');
  });
});
