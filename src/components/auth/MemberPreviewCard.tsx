import { cn } from 'cn';
import { useTranslation } from 'react-i18next';

import { SkillLevelSquare } from '@/components/league/SkillLevelSquare';
import type { MemberPreview } from '@/types/league';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);

  return parts
    .map((part) => {
      return part.slice(0, 1).toUpperCase();
    })
    .join('');
}

interface MemberPreviewCardProps {
  preview: MemberPreview;
}

// Shown before anything is written, so a mistyped digit cannot silently claim someone's record.
export function MemberPreviewCard({ preview }: MemberPreviewCardProps) {
  const { t } = useTranslation();
  const isTaken = preview.alreadyLinked && !preview.linkedToMe;

  const team =
    preview.teamNumber === null
      ? null
      : [preview.teamNumber, preview.teamName].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card border p-4',
        isTaken
          ? 'border-warn bg-[color-mix(in_oklab,var(--warn)_12%,var(--card))]'
          : 'border-line bg-card',
      )}
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chip font-semibold"
      >
        {initialsOf(preview.displayName)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{preview.displayName}</span>
          <SkillLevelSquare skillLevel={preview.skillLevel} />
        </span>

        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
          {team ?? t('link.noTeam')}
          {preview.isCaptain && ` · ${t('link.captain')}`}
        </span>
      </span>
    </div>
  );
}
