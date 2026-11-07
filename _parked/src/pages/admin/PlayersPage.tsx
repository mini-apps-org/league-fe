import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorBanner from '@/components/league/ErrorBanner';
import SkillLevelPanel from '@/components/league/SkillLevelPanel';
import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useDivisions, usePlayerSearch, useSeasons, useTeams } from '@/hooks/useLeague';
import { useTransferPlayer } from '@/hooks/useLeagueMutations';
import { ArrowRightLeft, Search, X } from '@/lib/icons';
import type { Player } from '@/types/league';

const MIN_SEARCH_LENGTH = 2;

export default function PlayersPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Player | null>(null);
  const [transferTeamId, setTransferTeamId] = useState('');

  const results = usePlayerSearch(query);
  const seasons = useSeasons();
  const activeSeason = seasons.data?.find((season) => season.isActive) ?? seasons.data?.[0];
  const divisions = useDivisions(activeSeason?.id);
  const teams = useTeams(divisions.data?.[0]?.id);
  const transfer = useTransferPlayer();

  const players = results.data ?? [];
  const isTooShort = query.trim().length < MIN_SEARCH_LENGTH;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('admin.playersTitle')}</h1>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          placeholder={t('admin.search')}
          aria-label={t('admin.search')}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          className="h-11 pr-10 pl-10"
        />
        {query !== '' && (
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t('admin.clearSearch')}
            className="absolute top-1/2 right-1 size-9 -translate-y-1/2"
            onClick={() => {
              setQuery('');
            }}
          >
            <X className="size-5" aria-hidden />
          </Button>
        )}
      </div>

      {results.error !== null && <ErrorBanner error={results.error} />}

      {isTooShort && <p className="text-sm text-muted-foreground">{t('admin.searchHint')}</p>}

      {!isTooShort && !results.isPending && players.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('admin.noResults')}</p>
      )}

      <ul className="divide-y divide-line">
        {players.map((player) => {
          return (
            <li key={player.id}>
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 py-2 text-left"
                onClick={() => {
                  setSelected(player);
                  setTransferTeamId('');
                }}
              >
                <SkillLevelSquare skillLevel={player.skillLevel} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{player.fullName}</span>
                  <span className="tabular block text-xs text-muted-foreground">
                    {player.memberId}
                  </span>
                </span>
                <span className="tabular shrink-0 text-xs text-muted-foreground">
                  {player.teamNumber ?? t('admin.noTeam')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Drawer
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DrawerContent>
          {selected !== null && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selected.fullName}</DrawerTitle>
                <p className="tabular text-sm text-muted-foreground">
                  {`${selected.memberId} · ${selected.teamNumber ?? t('admin.noTeam')}`}
                </p>
              </DrawerHeader>

              <div className="max-h-[70vh] overflow-y-auto">
                <SkillLevelPanel player={selected} />

                <section className="space-y-2 px-4 pb-8">
                  <h3 className="font-semibold">{t('admin.transfer')}</h3>
                  {transfer.error !== null && <ErrorBanner error={transfer.error} />}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <span className="sr-only">{t('admin.transfer')}</span>
                      <select
                        value={transferTeamId}
                        onChange={(event) => {
                          setTransferTeamId(event.target.value);
                        }}
                        className="h-11 w-full rounded-lg border border-input-line bg-chip px-3"
                      >
                        <option value="">{t('admin.noTeam')}</option>
                        {(teams.data ?? []).map((team) => {
                          return (
                            <option key={team.id} value={team.id}>
                              {`${team.teamNumber} ${team.name}`}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <Button
                      variant="outline"
                      className="h-11 shrink-0"
                      disabled={transferTeamId === '' || transfer.isPending}
                      onClick={() => {
                        transfer.mutate({ teamId: transferTeamId, playerId: selected.id });
                      }}
                    >
                      <ArrowRightLeft className="size-5" aria-hidden />
                      {t('admin.transferAction')}
                    </Button>
                  </div>
                </section>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
