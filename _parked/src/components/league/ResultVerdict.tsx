import { useTranslation } from 'react-i18next';

import type { MatchVerdict } from '@/lib/rules';

interface ResultVerdictProps {
  verdict: MatchVerdict;
  homeName: string;
  awayName: string;
  homeGames: number;
  awayGames: number;
}

// Live preview from rules.ts while the captain adjusts. Once saved, the screen renders the
// server's points from the response — the triggers are authoritative.
export default function ResultVerdict({
  verdict,
  homeName,
  awayName,
  homeGames,
  awayGames,
}: ResultVerdictProps) {
  const { t } = useTranslation();

  if (verdict.status === 'pending') {
    return (
      <p className="rounded-lg bg-sunken p-3 text-sm text-muted-foreground">
        {t('result.verdictPending')}
      </p>
    );
  }

  if (verdict.status === 'invalid') {
    return (
      <p className="rounded-lg bg-sunken p-3 text-sm text-warn">{t('result.verdictInvalid')}</p>
    );
  }

  const homeWon = verdict.winner === 'home';

  return (
    <div className="rounded-lg bg-sunken p-3">
      <p className="text-sm font-medium text-ok">
        {t('result.verdict', {
          winner: homeWon ? homeName : awayName,
          winnerGames: homeWon ? homeGames : awayGames,
          loserGames: homeWon ? awayGames : homeGames,
        })}
      </p>
      <p className="tabular text-sm text-text-2">
        {t('result.verdictPoints', {
          winnerPoints: homeWon ? verdict.homePoints : verdict.awayPoints,
          loserPoints: homeWon ? verdict.awayPoints : verdict.homePoints,
        })}
      </p>
    </div>
  );
}
