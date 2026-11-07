import { useTranslation } from 'react-i18next';

import AddPaidMemberSheet from '@/components/league/AddPaidMemberSheet';
import EmptyState from '@/components/league/EmptyState';
import RosterTable from '@/components/league/RosterTable';
import { Users } from '@/lib/icons';
import type { RosterPlayer } from '@/types/league';

interface RosterPanelProps {
  teamMatchId: string;
  teamId: string;
  players: readonly RosterPlayer[];
  canManage: boolean;
  // Shown on the desktop two-column layout, where both rosters are visible at once and the
  // tabs that would otherwise name them are gone.
  heading?: string;
}

export default function RosterPanel({
  teamMatchId,
  teamId,
  players,
  canManage,
  heading,
}: RosterPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {heading !== undefined && <h2 className="font-semibold">{heading}</h2>}
        {canManage && <AddPaidMemberSheet teamMatchId={teamMatchId} teamId={teamId} />}
      </div>

      {players.length === 0 ? (
        <EmptyState icon={Users} title={t('roster.emptyTitle')} body={t('roster.emptyBody')} />
      ) : (
        <RosterTable players={players} />
      )}
    </div>
  );
}
