import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorBanner from '@/components/league/ErrorBanner';
import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { usePlayerSearch } from '@/hooks/useLeague';
import { useAddRosterPlayer } from '@/hooks/useLeagueMutations';
import { UserPlus } from '@/lib/icons';

interface AddPaidMemberSheetProps {
  teamMatchId: string;
  teamId: string;
}

export default function AddPaidMemberSheet({ teamMatchId, teamId }: AddPaidMemberSheetProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = usePlayerSearch(query);
  const addPlayer = useAddRosterPlayer(teamMatchId);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="h-11">
          <UserPlus className="size-5" aria-hidden />
          {t('roster.addPaidMember')}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('roster.addPaidMember')}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-3 px-4 pb-6">
          <Input
            type="search"
            value={query}
            placeholder={t('admin.search')}
            aria-label={t('admin.search')}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            className="h-11"
          />

          {addPlayer.error !== null && <ErrorBanner error={addPlayer.error} />}

          <ul className="divide-y divide-line">
            {(results.data ?? []).map((player) => {
              return (
                <li key={player.id} className="flex items-center gap-3 py-2">
                  <SkillLevelSquare skillLevel={player.skillLevel} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{player.fullName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {player.memberId}
                      {!player.isPaid && ` · ${t('roster.unpaid')}`}
                    </span>
                  </span>
                  {/* Unpaid members are shown but not addable: the backend refuses them with
                      its own code, so hiding them would make the refusal inexplicable. */}
                  <Button
                    variant="outline"
                    className="h-11 shrink-0"
                    disabled={!player.isPaid || addPlayer.isPending}
                    onClick={() => {
                      addPlayer.mutate(
                        { teamId, playerId: player.id },
                        {
                          onSuccess: () => {
                            setIsOpen(false);
                          },
                        },
                      );
                    }}
                  >
                    {t('roster.addPaidMember')}
                  </Button>
                </li>
              );
            })}
          </ul>

          {query.trim().length < 2 && (
            <p className="text-sm text-muted-foreground">{t('admin.searchHint')}</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
