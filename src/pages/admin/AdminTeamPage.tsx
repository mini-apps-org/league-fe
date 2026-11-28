import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { EmptyState } from '@/components/league/EmptyState';
import { ErrorBanner } from '@/components/league/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { AddDivisionDrawer } from '@/components/teams/AddDivisionDrawer';
import { AddPlayerDrawer } from '@/components/teams/AddPlayerDrawer';
import { DeleteTeamDrawer } from '@/components/teams/DeleteTeamDrawer';
import { EditTeamDrawer } from '@/components/teams/EditTeamDrawer';
import type { PlayerActions } from '@/components/teams/PlayerActionsMenu';
import { RemoveDivisionDrawer } from '@/components/teams/RemoveDivisionDrawer';
import { RemovePlayerDrawer } from '@/components/teams/RemovePlayerDrawer';
import { RosterSection } from '@/components/teams/RosterSection';
import { TeamOverview } from '@/components/teams/TeamOverview';
import { TransferPlayerDrawer } from '@/components/teams/TransferPlayerDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasPermission } from '@/hooks/usePermissions';
import { useUpdateTeam } from '@/hooks/useTeamMutations';
import { useRoster, useTeam } from '@/hooks/useTeams';
import { isNotFoundError, messageFor } from '@/lib/errors';
import { ArrowLeft, Search } from '@/lib/icons';
import { DEFAULT_PAGE_SIZE } from '@/lib/paging';
import { TEAM_DIVISION_PARAM } from '@/lib/team-paths';
import { isUUID } from '@/lib/uuid';
import type { RosterPlayer } from '@/types/teams';
import { ROUTES } from '@/utils';

type TeamDrawer =
  | { kind: 'edit' }
  | { kind: 'delete' }
  | { kind: 'addPlayer' }
  | { kind: 'addDivision' }
  | { kind: 'removeDivision' }
  | { kind: 'transfer'; player: RosterPlayer }
  | { kind: 'removePlayer'; player: RosterPlayer };

export const AdminTeamPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: teamId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDivisionId = searchParams.get(TEAM_DIVISION_PARAM) ?? '';
  const divisionId = isUUID(rawDivisionId) ? rawDivisionId : '';
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [divisionInputKey, setDivisionInputKey] = useState(0);
  const [drawer, setDrawer] = useState<TeamDrawer | null>(null);

  const canUpdateTeam = useHasPermission('team.update');
  const canDeleteTeam = useHasPermission('team.delete');
  const canAddDivision = useHasPermission('team.create');
  const canAddPlayer = useHasPermission('roster.create');
  const canTransferPlayer = useHasPermission('roster.update');
  const canRemovePlayer = useHasPermission('roster.delete');

  const teamQuery = useTeam(teamId);
  const rosterQuery = useRoster(teamId, {
    division_id: divisionId,
    sort: 'joined_at',
    limit: pageSize,
  });
  const updateTeam = useUpdateTeam();
  const players = rosterQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const setDivision = (nextDivisionId: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        if (nextDivisionId === '') {
          next.delete(TEAM_DIVISION_PARAM);
        } else {
          next.set(TEAM_DIVISION_PARAM, nextDivisionId);
        }

        return next;
      },
      { replace: true },
    );
  };

  const setDivisionFromOutside = (nextDivisionId: string) => {
    setDivision(nextDivisionId);
    setDivisionInputKey((key) => {
      return key + 1;
    });
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  if (teamQuery.isPending) {
    return (
      <div className="flex flex-col gap-5" aria-busy>
        <PageTitle>{t('teams.detail.title')}</PageTitle>
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // A soft-deleted team is a 404 too: it no longer exists anywhere in the league.
  if (teamQuery.isError && isNotFoundError(teamQuery.error)) {
    return (
      <div className="flex flex-col gap-5">
        <PageTitle>{t('teams.detail.title')}</PageTitle>
        <EmptyState
          icon={Search}
          title={t('teams.detail.notFoundTitle')}
          body={t('teams.detail.notFoundBody')}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.ADMIN_TEAMS}>
                <ArrowLeft aria-hidden />
                {t('teams.detail.backToTeams')}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (teamQuery.isError) {
    return (
      <div className="flex flex-col gap-5">
        <PageTitle>{t('teams.detail.title')}</PageTitle>
        <ErrorBanner
          error={teamQuery.error}
          onRetry={() => {
            void teamQuery.refetch();
          }}
        />
      </div>
    );
  }

  const team = teamQuery.data;
  const captain = players.find((player) => player.is_captain);
  const hasDivision = divisionId !== '';

  const handleMakeCaptain = (player: RosterPlayer) => {
    updateTeam.mutate(
      { teamId: team.id, input: { captain_player_id: player.player_id } },
      {
        onSuccess: () => {
          toast.success(t('teams.roster.captainChanged', { name: player.full_name }));
        },
        onError: (err) => {
          toast.error(messageFor(err));
        },
      },
    );
  };

  const playerActions: PlayerActions = {
    onMakeCaptain: canUpdateTeam ? handleMakeCaptain : undefined,
    onTransfer: canTransferPlayer
      ? (player) => {
          setDrawer({ kind: 'transfer', player });
        }
      : undefined,
    onRemove: canRemovePlayer
      ? (player) => {
          setDrawer({ kind: 'removePlayer', player });
        }
      : undefined,
  };

  const openDrawer = (kind: 'edit' | 'delete' | 'addPlayer' | 'addDivision' | 'removeDivision') => {
    return () => {
      setDrawer({ kind });
    };
  };

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>{t('teams.detail.title')}</PageTitle>
      <TeamOverview
        team={team}
        captainName={captain?.full_name ?? null}
        activePlayers={hasDivision ? (rosterQuery.data?.pages[0]?.metadata.total ?? null) : null}
        onEdit={canUpdateTeam ? openDrawer('edit') : undefined}
        onDelete={canDeleteTeam ? openDrawer('delete') : undefined}
        onAddPlayer={canAddPlayer && rosterQuery.isSuccess ? openDrawer('addPlayer') : undefined}
      />
      <RosterSection
        divisionId={divisionId}
        divisionInputKey={divisionInputKey}
        rosterQuery={rosterQuery}
        pageSize={pageSize}
        playerActions={playerActions}
        onDivisionChange={setDivision}
        onPageSizeChange={setPageSize}
        onAddPlayer={canAddPlayer ? openDrawer('addPlayer') : undefined}
        onAddDivision={canAddDivision ? openDrawer('addDivision') : undefined}
        onRemoveDivision={canDeleteTeam ? openDrawer('removeDivision') : undefined}
      />

      {drawer?.kind === 'edit' && (
        <EditTeamDrawer team={team} captainCandidates={players} onClose={closeDrawer} />
      )}
      {drawer?.kind === 'delete' && (
        <DeleteTeamDrawer
          team={team}
          onClose={closeDrawer}
          onDeleted={() => {
            void navigate(ROUTES.ADMIN_TEAMS);
          }}
        />
      )}
      {drawer?.kind === 'addPlayer' && (
        <AddPlayerDrawer team={team} divisionId={divisionId} onClose={closeDrawer} />
      )}
      {drawer?.kind === 'addDivision' && (
        <AddDivisionDrawer
          team={team}
          onClose={closeDrawer}
          onAdded={(addedDivisionId) => {
            setDivisionFromOutside(addedDivisionId);
            closeDrawer();
          }}
        />
      )}
      {drawer?.kind === 'removeDivision' && (
        <RemoveDivisionDrawer
          team={team}
          divisionId={divisionId}
          onClose={closeDrawer}
          onRemoved={() => {
            setDivisionFromOutside('');
            closeDrawer();
          }}
        />
      )}
      {drawer?.kind === 'transfer' && (
        <TransferPlayerDrawer
          team={team}
          divisionId={divisionId}
          player={drawer.player}
          onClose={closeDrawer}
        />
      )}
      {drawer?.kind === 'removePlayer' && (
        <RemovePlayerDrawer
          team={team}
          divisionId={divisionId}
          player={drawer.player}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
};
