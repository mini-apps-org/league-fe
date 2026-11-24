import { http } from 'msw';
import { z } from 'zod';

import { ENDPOINTS } from '@/api/endpoints';

import { apiUrl, envelope, noContent, notFound, readJsonBody, validationFailed } from '../http';
import { buildPendingMatch } from '../league-night';
import {
  getLeagueStore,
  type IndividualMatchRow,
  type LeagueStore,
  updateLeagueStore,
} from '../league-store';
import { toIndividualMatch } from '../league-views';
import { rollUpNight, scoreIndividualMatch } from '../score-individual-match';

const playerIdSchema = z.string().min(1).nullable().optional();
const countSchema = z.int().min(0).optional();

const individualMatchPatchSchema = z.strictObject({
  homePlayerId: playerIdSchema,
  awayPlayerId: playerIdSchema,
  homeGames: countSchema,
  awayGames: countSchema,
  innings: z.int().min(0).nullable().optional(),
  homeDefShots: countSchema,
  awayDefShots: countSchema,
  status: z.enum(['pending', 'complete']).optional(),
});

const findIndividualMatch = (individualMatchId: string): IndividualMatchRow | undefined => {
  return getLeagueStore().individualMatches.find((match) => match.id === individualMatchId);
};

const saveIndividualMatch = (store: LeagueStore, next: IndividualMatchRow): LeagueStore => {
  const withMatch = {
    ...store,
    individualMatches: store.individualMatches.map((match) =>
      match.id === next.id ? next : match,
    ),
  };

  return rollUpNight(withMatch, next.teamMatchId);
};

const INDIVIDUAL_MATCH_PATH = `${ENDPOINTS.INDIVIDUAL_MATCHES}/:individualMatchId`;

export const individualMatchHandlers = [
  http.patch<{ individualMatchId: string }>(
    apiUrl(INDIVIDUAL_MATCH_PATH),
    async ({ params, request }) => {
      const row = findIndividualMatch(params.individualMatchId);
      if (!row) {
        return notFound();
      }

      const parsed = individualMatchPatchSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        return validationFailed();
      }

      const next = scoreIndividualMatch({ store: getLeagueStore(), row, patch: parsed.data });
      if (!next) {
        return validationFailed();
      }

      updateLeagueStore((store) => {
        return saveIndividualMatch(store, next);
      });

      return envelope(toIndividualMatch(getLeagueStore(), next));
    },
  ),

  // Resets the slot rather than removing it, so a night always keeps its five matches.
  http.delete<{ individualMatchId: string }>(apiUrl(INDIVIDUAL_MATCH_PATH), ({ params }) => {
    const row = findIndividualMatch(params.individualMatchId);
    if (!row) {
      return notFound();
    }

    updateLeagueStore((store) => {
      return saveIndividualMatch(store, {
        ...buildPendingMatch(row.teamMatchId, row.matchOrder),
        id: row.id,
      });
    });

    return noContent();
  }),
];
