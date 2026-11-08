import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { apiError, apiUrl, envelope, UNLINKED_USER } from '@/test/handlers';
import { renderRoutes } from '@/test/render';
import { server } from '@/test/server';
import { ERROR_CODE } from '@/types/errors';

import { RequireAuth } from './RequireAuth';

function renderGate(route = '/') {
  return renderRoutes(
    [
      { path: '/login', element: <p>login screen</p> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <p>home screen</p> },
          { path: '/onboarding', element: <p>onboarding screen</p> },
        ],
      },
    ],
    { route },
  );
}

describe('RequireAuth', () => {
  it('renders the protected route for a signed-in, linked user', async () => {
    renderGate();

    expect(await screen.findByText('home screen')).toBeInTheDocument();
  });

  it('sends a signed-out visitor to /login', async () => {
    server.use(
      http.get(apiUrl(ENDPOINTS.ME), () => {
        return apiError(401, ERROR_CODE.NO_SESSION);
      }),
    );

    const { router } = renderGate();

    expect(await screen.findByText('login screen')).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ from: '/' });
  });

  it('sends a user with no linked player to /onboarding', async () => {
    server.use(
      http.get(apiUrl(ENDPOINTS.ME), () => {
        return envelope({ user: UNLINKED_USER });
      }),
    );

    renderGate();

    expect(await screen.findByText('onboarding screen')).toBeInTheDocument();
  });

  it('lets an unlinked user stay on /onboarding instead of looping', async () => {
    server.use(
      http.get(apiUrl(ENDPOINTS.ME), () => {
        return envelope({ user: UNLINKED_USER });
      }),
    );

    renderGate('/onboarding');

    expect(await screen.findByText('onboarding screen')).toBeInTheDocument();
  });
});
