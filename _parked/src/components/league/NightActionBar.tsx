import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import SubmitNightSheet from '@/components/league/SubmitNightSheet';
import { Button } from '@/components/ui/button';
import { nextAction } from '@/lib/night';
import type { TeamMatchDetail } from '@/types/league';

interface NightActionBarProps {
  detail: TeamMatchDetail;
}

// The one primary action for the night, driven by nextAction() so the bar, the scoresheet
// and the routing cannot disagree. Renders nothing for a viewer who may not manage: a
// control that can never be enabled is noise, and the backend enforces the rule regardless.
export default function NightActionBar({ detail }: NightActionBarProps) {
  const { t } = useTranslation();

  if (!detail.viewerCanManage) {
    return null;
  }

  const action = nextAction(detail);

  if (action.kind === 'done') {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t('night.submittedBy', { name: detail.homeTeam.name })}
      </p>
    );
  }

  if (action.kind === 'submit') {
    return <SubmitNightSheet teamMatchId={detail.id} />;
  }

  const to =
    action.kind === 'put-up'
      ? `/matches/${detail.id}/put-up`
      : `/matches/${detail.id}/result/${action.matchOrder}`;

  return (
    <Button asChild className="h-12 w-full">
      <Link to={to}>{t('roster.startMatch')}</Link>
    </Button>
  );
}
