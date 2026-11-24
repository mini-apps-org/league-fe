import '@/i18n';
import './index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';
import { registerServiceWorker } from '@/lib/register-sw';
import { router } from '@/router';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root element is missing from index.html');
}

// Dev only: mocks the session routes until league-be serves them; auth stays real. On by
// default, off with VITE_API_MOCKS=false. The dynamic import sits behind import.meta.env.DEV,
// so production builds drop MSW entirely.
const startMockApi = async (): Promise<void> => {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKS === 'false') {
    return;
  }

  const { worker } = await import('@/test/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
};

const renderApp = (container: HTMLElement): void => {
  createRoot(container).render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
};

// The worker must be ready before the first request, or /me reaches the real backend.
startMockApi()
  .catch((error: unknown) => {
    console.warn('mock API failed to start; requests go to the real backend', error);
  })
  .finally(() => {
    renderApp(root);
  });

registerServiceWorker();
