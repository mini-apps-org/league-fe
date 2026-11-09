import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { createMemoryRouter, RouterProvider } from 'react-router';

interface RenderRoutesOptions {
  route?: string;
}

// A fresh QueryClient per test, so no cached `me` leaks from one test into the next.
export function renderRoutes(routes: RouteObject[], { route = '/' }: RenderRoutesOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [route] });

  return {
    user: userEvent.setup(),
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}

export function renderWithProviders(ui: ReactElement, options: RenderRoutesOptions = {}) {
  return renderRoutes([{ path: '*', element: ui }], options);
}
