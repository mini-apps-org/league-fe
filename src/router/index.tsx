import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/components/AppLayout';
import RequireAuth from '@/components/RequireAuth';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import OnboardingPage from '@/pages/OnboardingPage';
import PrivacyPage from '@/pages/PrivacyPage';
import RulesPage from '@/pages/RulesPage';
import LoginPage from '@/pages/auth/LoginPage';

// Auth and login only. The league routes — schedule, match night, put-up, result entry and
// admin players — are parked in /_parked with a restore manifest, to be brought back once the
// sign-in flow is complete and stable.
export const router = createBrowserRouter([
  // Outside the gate: RequireAuth redirects here, so gating it would loop.
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
          // The landing route. Also where a completed sign-in arrives, so the stored `next`
          // path is consumed here — see RequireAuth.
          {
            path: '/',
            element: <HomePage />,
          },
        ],
      },
      // No AppLayout: this screen has its own sign-out, and the header's nav would offer
      // links the gate is about to bounce the user back from.
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
