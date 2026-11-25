import type { PageNameProps } from '@/hooks/usePageTitle';
import { useTeam } from '@/hooks/useTeams';

// The team detail page's last breadcrumb. It reads the query the page already runs, so the
// header costs no extra request.
export const TeamPageName = ({ params, fallback }: PageNameProps) => {
  const teamQuery = useTeam(params.id ?? '');

  return teamQuery.data?.name ?? fallback;
};
