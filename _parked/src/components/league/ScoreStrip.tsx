import type { TeamMatchDetail } from '@/types/league';

interface ScoreStripProps {
  detail: TeamMatchDetail;
}

export default function ScoreStrip({ detail }: ScoreStripProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-sunken p-4">
      <div className="min-w-0 flex-1">
        <p className="tabular text-3xl leading-none font-bold">{detail.homePoints}</p>
        <p className="tabular mt-1 truncate text-xs text-muted-foreground">
          {detail.homeTeam.teamNumber}
        </p>
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="tabular text-3xl leading-none font-bold">{detail.awayPoints}</p>
        <p className="tabular mt-1 truncate text-xs text-muted-foreground">
          {detail.awayTeam.teamNumber}
        </p>
      </div>
    </div>
  );
}
