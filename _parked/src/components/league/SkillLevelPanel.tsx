import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorBanner from '@/components/league/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSkillLevelHistory } from '@/hooks/useLeague';
import { useChangeSkillLevel } from '@/hooks/useLeagueMutations';
import { formatDate } from '@/lib/format';
import { Clock } from '@/lib/icons';
import { raceFor, SKILL_LEVEL_MAX, SKILL_LEVEL_MIN } from '@/lib/rules';
import { skillLevelChangeSchema } from '@/lib/schemas';
import { cn } from 'cn';
import type { Player } from '@/types/league';

// SL 5 is the reference opponent because it is the middle of the 2-7 range, so the preview
// shows the effect of the change rather than an arbitrary matchup.
const REFERENCE_SKILL_LEVEL = 5;

const LEVELS = Array.from({ length: SKILL_LEVEL_MAX - SKILL_LEVEL_MIN + 1 }, (_, index) => {
  return SKILL_LEVEL_MIN + index;
});

export default function SkillLevelPanel({ player }: { player: Player }) {
  const { t } = useTranslation();
  const [chosenLevel, setChosenLevel] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const changeSkillLevel = useChangeSkillLevel();
  const history = useSkillLevelHistory(player.id);

  const level = chosenLevel ?? player.skillLevel;
  const parsed = skillLevelChangeSchema.safeParse({ newSkillLevel: level, reason });
  const isChanged = level !== player.skillLevel;

  const before = raceFor(player.skillLevel, REFERENCE_SKILL_LEVEL);
  const after = raceFor(level, REFERENCE_SKILL_LEVEL);

  return (
    <div className="space-y-6 px-4 pb-6">
      <section className="space-y-2">
        <h3 className="font-semibold">{t('admin.skillLevel')}</h3>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((candidate) => {
            return (
              <button
                key={candidate}
                type="button"
                aria-pressed={candidate === level}
                onClick={() => {
                  setChosenLevel(candidate);
                }}
                className={cn(
                  'tabular size-11 rounded-lg font-medium',
                  candidate === level
                    ? 'bg-primary text-primary-foreground'
                    : candidate === player.skillLevel
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-chip text-foreground',
                )}
              >
                {candidate}
              </button>
            );
          })}
        </div>

        {after !== null && before !== null && (
          <p className="text-sm text-muted-foreground">
            {t('admin.racePreview', { now: after.home, before: before.home })}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('admin.appliesNextMatch')}</p>
      </section>

      <section className="space-y-2">
        <label htmlFor="sl-reason" className="text-sm font-medium">
          {t('admin.reason')}
        </label>
        {/* change_skill_level() rejects a blank reason, so it is validated here too: a 400
            after the admin has typed everything else loses their work. */}
        <Textarea
          id="sl-reason"
          rows={2}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
          }}
        />
        <p className="text-xs text-muted-foreground">{t('admin.reasonHelp')}</p>
      </section>

      {changeSkillLevel.error !== null && <ErrorBanner error={changeSkillLevel.error} />}

      <Button
        className="h-12 w-full"
        disabled={!parsed.success || !isChanged || changeSkillLevel.isPending}
        onClick={() => {
          changeSkillLevel.mutate(
            { playerId: player.id, input: { newSkillLevel: level, reason: reason.trim() } },
            {
              onSuccess: () => {
                setChosenLevel(null);
                setReason('');
              },
            },
          );
        }}
      >
        {t('admin.saveSkillLevel')}
      </Button>

      <section className="space-y-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <Clock className="size-5" aria-hidden />
          {t('admin.history')}
        </h3>

        {(history.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('admin.historyEmpty')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {(history.data ?? []).map((change) => {
              return (
                <li key={change.id} className="py-2">
                  <p className="tabular font-medium">
                    {`${change.oldSkillLevel} → ${change.newSkillLevel}`}
                  </p>
                  {change.reason !== null && <p className="text-sm text-text-2">{change.reason}</p>}
                  <p className="text-xs text-muted-foreground">
                    {`${t('admin.changedBy', { name: change.changedByName ?? '' })} · ${formatDate(change.changedAt)}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
