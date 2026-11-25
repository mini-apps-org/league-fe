import { createBrowserRouter } from 'react-router';

import { AppLayout } from '@/components/AppLayout';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireRole } from '@/components/RequireRole';
import { TeamPageName } from '@/components/teams/TeamPageName';
import type { RouteHandle } from '@/hooks/usePageTitle';
import { AdminTeamPage } from '@/pages/admin/AdminTeamPage';
import { AdminTeamsPage } from '@/pages/admin/AdminTeamsPage';
import { AuditPage } from '@/pages/admin/AuditPage';
import { DivisionsPage } from '@/pages/admin/DivisionsPage';
import { FeesPage } from '@/pages/admin/FeesPage';
import { PlayersPage } from '@/pages/admin/PlayersPage';
import { SessionDetailPage } from '@/pages/admin/sessions/SessionDetailPage';
import { SessionsPage } from '@/pages/admin/sessions/SessionsPage';
import { TeamMatchDetailPage } from '@/pages/admin/sessions/TeamMatchDetailPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { RouteErrorPage } from '@/pages/errors/RouteErrorPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { RulesPage } from '@/pages/legal/RulesPage';
import { LiveScoringPage } from '@/pages/match/LiveScoringPage';
import { MatchPage } from '@/pages/match/MatchPage';
import { PutUpPage } from '@/pages/match/PutUpPage';
import { ResultPage } from '@/pages/match/ResultPage';
import { VerifyPage } from '@/pages/match/VerifyPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SchedulePage } from '@/pages/schedule/SchedulePage';
import { StandingsPage } from '@/pages/standings/StandingsPage';
import { MemberSessionPage } from '@/pages/team/MemberSessionPage';
import { RosterPage } from '@/pages/team/RosterPage';
import { TeamSettingsPage } from '@/pages/team/TeamSettingsPage';
import { ROLE, ROUTES } from '@/utils';

const titled = (titleKey: RouteHandle['titleKey']): RouteHandle => {
  return { titleKey };
};

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.RULES,
        element: <RulesPage />,
      },
      {
        path: ROUTES.PRIVACY,
        element: <PrivacyPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: ROUTES.HOME,
                element: <SchedulePage />,
                handle: titled('schedule.title'),
              },
              {
                path: ROUTES.MATCH,
                element: <MatchPage />,
                handle: titled('match.title'),
              },
              {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />,
                handle: titled('dashboard.title'),
              },
              {
                path: ROUTES.STANDINGS,
                element: <StandingsPage />,
                handle: titled('standings.title'),
              },
              {
                path: ROUTES.PROFILE,
                element: <ProfilePage />,
                handle: titled('profile.title'),
              },

              {
                element: <RequireRole allowed={[ROLE.SUPER_ADMIN, ROLE.CAPTAIN]} />,
                children: [
                  {
                    path: ROUTES.MATCH_PUT_UP,
                    element: <PutUpPage />,
                    handle: titled('match.title'),
                  },
                  {
                    path: ROUTES.MATCH_RESULT,
                    element: <ResultPage />,
                    handle: titled('match.title'),
                  },
                  {
                    path: ROUTES.TEAM_ROSTER,
                    element: <RosterPage />,
                    handle: titled('roster.title'),
                  },
                  {
                    path: ROUTES.TEAM_SETTINGS,
                    element: <TeamSettingsPage />,
                    handle: titled('teamSettings.title'),
                  },
                  {
                    path: ROUTES.TEAM_MEMBER_SESSION,
                    element: <MemberSessionPage />,
                    handle: titled('memberSession.title'),
                  },
                  {
                    path: ROUTES.MATCH_LIVE,
                    element: <LiveScoringPage />,
                    handle: titled('liveScoring.title'),
                  },
                  {
                    path: ROUTES.MATCH_VERIFY,
                    element: <VerifyPage />,
                    handle: titled('verify.title'),
                  },
                ],
              },

              {
                element: <RequireRole allowed={[ROLE.SUPER_ADMIN]} />,
                children: [
                  {
                    path: ROUTES.ADMIN_PLAYERS,
                    element: <PlayersPage />,
                    handle: titled('admin.playersTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_SESSIONS,
                    element: <SessionsPage />,
                    handle: titled('admin.sessions.title'),
                  },
                  {
                    path: ROUTES.ADMIN_SESSION,
                    element: <SessionDetailPage />,
                    handle: titled('admin.sessions.detailTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_SESSION_MATCH,
                    element: <TeamMatchDetailPage />,
                    handle: titled('admin.sessions.matchTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_TEAMS,
                    element: <AdminTeamsPage />,
                    handle: titled('admin.teamsTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_TEAM,
                    element: <AdminTeamPage />,
                    handle: { ...titled('teams.detail.title'), PageName: TeamPageName },
                  },
                  {
                    path: ROUTES.ADMIN_DIVISIONS,
                    element: <DivisionsPage />,
                    handle: titled('admin.divisionsTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_FEES,
                    element: <FeesPage />,
                    handle: titled('admin.feesTitle'),
                  },
                  {
                    path: ROUTES.ADMIN_AUDIT,
                    element: <AuditPage />,
                    handle: titled('admin.auditTitle'),
                  },
                ],
              },
            ],
          },
          {
            path: ROUTES.ONBOARDING,
            element: <OnboardingPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
