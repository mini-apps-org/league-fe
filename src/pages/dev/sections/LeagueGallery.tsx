import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ByeBanner } from '@/components/league/ByeBanner';
import { EmptyState } from '@/components/league/EmptyState';
import { ErrorBanner } from '@/components/league/ErrorBanner';
import { FixtureCard } from '@/components/league/FixtureCard';
import { ReasonChip } from '@/components/league/ReasonChip';
import { RosterRow } from '@/components/league/RosterRow';
import { ScoresheetRow } from '@/components/league/ScoresheetRow';
import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import { StatusBadge } from '@/components/league/StatusBadge';
import { Stepper } from '@/components/league/Stepper';
import { Button } from '@/components/ui/button';
import { CalendarOff, UserPlus } from '@/lib/icons';
import type { TeamMatchStatus } from '@/types/league';

import {
  SAMPLE_BYE_TEAM,
  SAMPLE_FIXTURE,
  SAMPLE_PLAYED_MATCH,
  SAMPLE_ROSTER,
  SAMPLE_SELECTED_PLAYER_ID,
  SAMPLE_SKILL_LEVELS,
  SAMPLE_STEPS,
  type SampleStep,
} from '../gallerySamples';
import { GallerySection } from '../GallerySection';
import { LEAGUE } from '../galleryVariants';
import { VariantRow } from '../VariantRow';

const STATUSES: readonly TeamMatchStatus[] = ['scheduled', 'in_progress', 'submitted'];
const REASONS = ['would_break_23', 'already_put_up', 'not_on_roster', 'side_complete'] as const;
const SAMPLE_ERROR = new Error('gallery sample');

function noop(): void {
  return undefined;
}

function GalleryStepper({ label, initialValue, max }: SampleStep) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-full max-w-md rounded-card border border-line">
      <Stepper label={label} value={value} max={max} onChange={setValue} />
    </div>
  );
}

export function LeagueGallery() {
  const { t } = useTranslation();

  return (
    <>
      <GallerySection entry={LEAGUE['skill-level-square']}>
        <VariantRow name="skillLevel">
          {SAMPLE_SKILL_LEVELS.map((level) => (
            <SkillLevelSquare key={level} skillLevel={level} />
          ))}
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE['status-badge']}>
        {STATUSES.map((status) => (
          <VariantRow key={status} name={`status="${status}"`}>
            <StatusBadge status={status} />
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={LEAGUE['reason-chip']}>
        {REASONS.map((reason) => (
          <VariantRow key={reason} name={`reason="${reason}"`}>
            <ReasonChip reason={reason} />
          </VariantRow>
        ))}
        <VariantRow name={'reason="unpaid"'}>
          <ReasonChip reason="unpaid" />
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE['fixture-card']}>
        {STATUSES.map((status) => (
          <VariantRow key={status} name={`status="${status}"`}>
            <div className="w-full max-w-sm">
              <FixtureCard fixture={{ ...SAMPLE_FIXTURE, id: status, status }} />
            </div>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={LEAGUE['bye-banner']}>
        <VariantRow name="default">
          <div className="w-full max-w-sm">
            <ByeBanner team={SAMPLE_BYE_TEAM} />
          </div>
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE['roster-row']}>
        <VariantRow name="paid · unpaid · selected">
          <ul className="w-full max-w-md overflow-hidden rounded-card border border-line">
            {SAMPLE_ROSTER.map((player) => (
              <RosterRow
                key={player.playerId}
                player={player}
                selection={player.playerId === SAMPLE_SELECTED_PLAYER_ID ? 'selected' : 'none'}
              />
            ))}
          </ul>
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE['scoresheet-row']}>
        <VariantRow name="played · not played">
          <ul className="w-full max-w-md overflow-hidden rounded-card border border-line">
            <ScoresheetRow order={3} match={SAMPLE_PLAYED_MATCH} />
            <ScoresheetRow order={4} match={undefined} />
          </ul>
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE.stepper}>
        {SAMPLE_STEPS.map((step) => (
          <VariantRow key={step.name} name={step.name}>
            <GalleryStepper {...step} />
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={LEAGUE['error-banner']}>
        <VariantRow name="with retry" className="flex-col items-stretch">
          <ErrorBanner error={SAMPLE_ERROR} onRetry={noop} />
        </VariantRow>
        <VariantRow name="without retry" className="flex-col items-stretch">
          <ErrorBanner error={SAMPLE_ERROR} />
        </VariantRow>
      </GallerySection>

      <GallerySection entry={LEAGUE['empty-state']}>
        <VariantRow name="without action" className="items-stretch">
          <div className="w-full max-w-sm">
            <EmptyState
              icon={CalendarOff}
              title={t('schedule.emptyTitle')}
              body={t('schedule.emptyBody')}
            />
          </div>
        </VariantRow>
        <VariantRow name="with action" className="items-stretch">
          <div className="w-full max-w-sm">
            <EmptyState
              icon={UserPlus}
              title={t('roster.emptyTitle')}
              body={t('roster.emptyBody')}
              action={<Button size="touch">{t('roster.addPaidMember')}</Button>}
            />
          </div>
        </VariantRow>
      </GallerySection>
    </>
  );
}
