import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';
import '@/i18n';
import { queryClient } from '@/lib/query-client';
import { registerServiceWorker } from '@/lib/register-sw';
import { router } from '@/router';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root element is missing from index.html');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);

registerServiceWorker();
