import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router';

import { StatusBadge } from '@/components/league/StatusBadge';
import { formatFixtureDateTime } from '@/lib/format';
import type { TeamMatchSummary, TeamRef } from '@/types/league';
import { ROUTES } from '@/utils';

// A result exists only once a match has been scored; before that the card shows no score
// rather than 0-0, which would read as a played draw.
function hasScore(fixture: TeamMatchSummary): boolean {
  return fixture.status !== 'scheduled';
}

interface TeamLineProps {
  team: TeamRef;
  points: number | null;
}

function TeamLine({ team, points }: TeamLineProps) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="tabular text-[13px] text-muted-foreground">{team.teamNumber}</span>
      <span className="min-w-0 flex-1 truncate font-semibold">{team.name}</span>
      {points !== null && <span className="tabular text-xl font-bold">{points}</span>}
    </p>
  );
}

interface FixtureCardProps {
  fixture: TeamMatchSummary;
}

export function FixtureCard({ fixture }: FixtureCardProps) {
  const { t } = useTranslation();
  const scored = hasScore(fixture);

  return (
    // The whole card is the link, so the touch target is the card, not the team name.
    <Link
      to={generatePath(ROUTES.MATCH, { id: fixture.id })}
      className="flex min-h-22 flex-col gap-3 rounded-card border border-line bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={fixture.status} />
        <span className="tabular text-[13px] text-muted-foreground">
          {formatFixtureDateTime(fixture.scheduledAt)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <TeamLine team={fixture.homeTeam} points={scored ? fixture.homePoints : null} />
        <span className="sr-only">{t('schedule.vs')}</span>
        <TeamLine team={fixture.awayTeam} points={scored ? fixture.awayPoints : null} />
      </div>

      {fixture.venue !== null && (
        <span className="text-[13px] text-muted-foreground">{fixture.venue.name}</span>
      )}
    </Link>
  );
}
