import { useTranslation } from 'react-i18next';

import SkillLevelSquare from '@/components/league/SkillLevelSquare';
import { formatRecord } from '@/lib/format';
import type { RosterPlayer } from '@/types/league';

export default function RosterTable({ players }: { players: readonly RosterPlayer[] }) {
  const { t } = useTranslation();

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">{t('roster.caption')}</caption>
      <thead>
        <tr className="border-b border-line text-xs font-medium text-muted-foreground">
          <th scope="col" className="py-2 text-left">
            {t('roster.player')}
          </th>
          <th scope="col" className="py-2 text-right">
            {t('roster.skillLevel')}
          </th>
          <th scope="col" className="py-2 text-right">
            {t('roster.record')}
          </th>
          <th scope="col" className="py-2 text-right">
            {t('roster.points')}
          </th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => {
          return (
            <tr key={player.playerId} className="border-b border-line last:border-0">
              <td className="py-2 pr-2">
                <span className="block">{player.fullName}</span>
                <span className="block text-xs text-muted-foreground">
                  {player.memberId}
                  {!player.isPaid && ` · ${t('roster.unpaid')}`}
                </span>
              </td>
              <td className="py-2 text-right">
                <SkillLevelSquare skillLevel={player.skillLevel} />
              </td>
              {/* Zeros, never blanks: player_division_stats coalesces, so a player who has
                  not played shows 0/0 rather than an empty cell. */}
              <td className="py-2 text-right font-medium">
                {formatRecord(player.matchesWon, player.matchesPlayed)}
              </td>
              <td className="py-2 text-right font-medium">{player.totalPoints}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
