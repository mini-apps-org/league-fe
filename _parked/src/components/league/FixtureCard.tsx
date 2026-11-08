import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import StatusBadge from '@/components/league/StatusBadge';
import { formatFixtureDateTime } from '@/lib/format';
import type { TeamMatchSummary } from '@/types/league';

// A result exists only once a match has been scored; before that the card shows no score
// rather than 0-0, which would read as a played draw.
function hasScore(fixture: TeamMatchSummary): boolean {
  return fixture.status !== 'scheduled';
}

interface FixtureCardProps {
  fixture: TeamMatchSummary;
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
  const { t } = useTranslation();
  const venueName = fixture.venue?.name ?? '';
  const when = formatFixtureDateTime(fixture.scheduledAt);
  const meta = venueName === '' ? when : `${venueName} · ${when}`;

  return (
    // The whole card is the link, so the touch target is the card, not the team name.
    <Link
      to={`/matches/${fixture.id}`}
      className="block rounded-card border border-line bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate">
            <span className="tabular mr-2 text-xs text-muted-foreground">
              {fixture.homeTeam.teamNumber}
            </span>
            <span className="font-medium">{fixture.homeTeam.name}</span>
          </p>
          <p className="truncate">
            <span className="sr-only">{`${t('schedule.vs')} `}</span>
            <span className="tabular mr-2 text-xs text-muted-foreground">
              {fixture.awayTeam.teamNumber}
            </span>
            <span className="font-medium">{fixture.awayTeam.name}</span>
          </p>
        </div>

        {hasScore(fixture) && (
          <p className="tabular text-3xl leading-none font-bold">
            {fixture.homePoints}
            <span className="text-muted-foreground">–</span>
            {fixture.awayPoints}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
        <StatusBadge status={fixture.status} />
      </div>
    </Link>
  );
}
