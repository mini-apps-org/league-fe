import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  LINKED_USER,
  meHandler,
  PLAYER_PERMISSIONS,
  PLAYER_ROLES,
  SUPER_ADMIN_PERMISSIONS,
  SUPER_ADMIN_ROLES,
} from '@/test/handlers';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';

import { PermissionGate } from './PermissionGate';

describe('PermissionGate', () => {
  it('renders children when user has the required permission', async () => {
    server.use(meHandler(LINKED_USER, SUPER_ADMIN_ROLES, SUPER_ADMIN_PERMISSIONS));

    renderWithProviders(
      <PermissionGate required="player.change_skill_level">
        <p>change skill level</p>
      </PermissionGate>,
    );

    expect(await screen.findByText('change skill level')).toBeInTheDocument();
  });

  it('hides children when user lacks the required permission', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderWithProviders(
      <PermissionGate required="player.change_skill_level">
        <p>change skill level</p>
      </PermissionGate>,
    );

    await waitFor(() => {
      expect(screen.queryByText('change skill level')).not.toBeInTheDocument();
    });
  });

  it('renders fallback when user lacks the required permission', async () => {
    server.use(meHandler(LINKED_USER, PLAYER_ROLES, PLAYER_PERMISSIONS));

    renderWithProviders(
      <PermissionGate required="player.change_skill_level" fallback={<p>view only</p>}>
        <p>change skill level</p>
      </PermissionGate>,
    );

    expect(await screen.findByText('view only')).toBeInTheDocument();
    expect(screen.queryByText('change skill level')).not.toBeInTheDocument();
  });
});
