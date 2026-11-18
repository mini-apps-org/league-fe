import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CAPTAIN_PERMISSIONS,
  CAPTAIN_ROLES,
  LINKED_USER,
  meHandler,
  PLAYER_PERMISSIONS,
  PLAYER_ROLES,
  SUPER_ADMIN_PERMISSIONS,
  SUPER_ADMIN_ROLES,
} from '@/test/handlers';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';
import { ROLE } from '@/utils';

import { RoleGate } from './RoleGate';

describe('RoleGate', () => {
  it('renders children when user has the allowed role', async () => {
    server.use(meHandler(LINKED_USER, SUPER_ADMIN_ROLES, SUPER_ADMIN_PERMISSIONS));

    renderWithProviders(
      <RoleGate allowed={[ROLE.SUPER_ADMIN]}>
        <p>admin content</p>
      </RoleGate>,
    );

    expect(await screen.findByText('admin content')).toBeInTheDocument();
  });

  it('hides children when user lacks the allowed role', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderWithProviders(
      <RoleGate allowed={[ROLE.SUPER_ADMIN]}>
        <p>admin content</p>
      </RoleGate>,
    );

    await waitFor(() => {
      expect(screen.queryByText('admin content')).not.toBeInTheDocument();
    });
  });

  it('renders fallback when user lacks the allowed role', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderWithProviders(
      <RoleGate allowed={[ROLE.SUPER_ADMIN]} fallback={<p>no access</p>}>
        <p>admin content</p>
      </RoleGate>,
    );

    expect(await screen.findByText('no access')).toBeInTheDocument();
    expect(screen.queryByText('admin content')).not.toBeInTheDocument();
  });

  it('renders children when user has one of multiple allowed roles', async () => {
    server.use(meHandler(LINKED_USER, CAPTAIN_ROLES, CAPTAIN_PERMISSIONS));

    renderWithProviders(
      <RoleGate allowed={[ROLE.SUPER_ADMIN, ROLE.CAPTAIN]}>
        <p>captain content</p>
      </RoleGate>,
    );

    expect(await screen.findByText('captain content')).toBeInTheDocument();
  });
});
