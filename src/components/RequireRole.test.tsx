import { screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it } from 'vitest';

import {
  CAPTAIN_PERMISSIONS,
  CAPTAIN_ROLES,
  LINKED_USER,
  PLAYER_PERMISSIONS,
  PLAYER_ROLES,
  SUPER_ADMIN_PERMISSIONS,
  SUPER_ADMIN_ROLES,
} from '@/test/handlers';
import { meHandler } from '@/test/handlers';
import { renderRoutes } from '@/test/render';
import { server } from '@/test/server';
import type { Role } from '@/types/league';
import { ROLE } from '@/utils';

import { RequireRole } from './RequireRole';

const renderGate = (allowed: Role[], route = '/protected') => {
  return renderRoutes(
    [
      {
        element: <RequireRole allowed={allowed} />,
        children: [{ path: '/protected', element: <p>protected content</p> }],
      },
      { path: '/', element: <p>home</p> },
    ],
    { route },
  );
};

describe('RequireRole', () => {
  it('renders child route when user has the required role', async () => {
    server.use(meHandler(LINKED_USER, SUPER_ADMIN_ROLES, SUPER_ADMIN_PERMISSIONS));

    renderGate([ROLE.SUPER_ADMIN]);

    expect(await screen.findByText('protected content')).toBeInTheDocument();
  });

  it('renders child route when user has one of multiple allowed roles', async () => {
    server.use(meHandler(LINKED_USER, CAPTAIN_ROLES, CAPTAIN_PERMISSIONS));

    renderGate([ROLE.SUPER_ADMIN, ROLE.CAPTAIN]);

    expect(await screen.findByText('protected content')).toBeInTheDocument();
  });

  it('shows unauthorized message when user lacks the required role', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderGate([ROLE.SUPER_ADMIN]);

    expect(await screen.findByText(i18next.t('auth.unauthorized'))).toBeInTheDocument();
  });

  it('shows unauthorized for PLAYER accessing CAPTAIN+ADMIN route', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderGate([ROLE.SUPER_ADMIN, ROLE.CAPTAIN]);

    expect(await screen.findByText(i18next.t('auth.unauthorized'))).toBeInTheDocument();
  });
});
