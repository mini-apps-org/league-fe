import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/components/AppLayout';
import RequireAuth from '@/components/RequireAuth';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import OnboardingPage from '@/pages/OnboardingPage';
import PrivacyPage from '@/pages/PrivacyPage';
import RulesPage from '@/pages/RulesPage';
import LoginPage from '@/pages/auth/LoginPage';

// Auth and login only. The league routes are parked in /_parked; see its RESTORE.md.
export const router = createBrowserRouter([
  // Gating this would loop: RequireAuth redirects here.
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Linked from the signed-out login screen, so they cannot sit behind the gate.
  {
    path: '/rules',
    element: <RulesPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Where a completed sign-in arrives, so the stored `next` is consumed here.
          {
            path: '/',
            element: <HomePage />,
          },
        ],
      },
      // No AppLayout: the header's nav would offer links the gate bounces the user back from.
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
