import type { IndividualMatch, Side, TeamMatchDetail } from '@/types/league';

export const MATCHES_PER_NIGHT = 5;

// Home puts up first in match 1, then the sides alternate. The server owns first_put_up on a
// row that exists; this derives it for a match whose row has not been created yet.
export function firstPutUpFor(matchOrder: number): Side {
  return matchOrder % 2 === 1 ? 'home' : 'away';
}

export type NightAction =
  | { kind: 'put-up'; matchOrder: number; side: Side }
  | { kind: 'result'; matchOrder: number; individualMatchId: string }
  | { kind: 'submit' }
  | { kind: 'done' };

function sideToPutUp(match: IndividualMatch): Side | null {
  if (match.homePlayerId === null && match.awayPlayerId === null) {
    return match.firstPutUp;
  }

  if (match.homePlayerId === null) {
    return 'home';
  }

  if (match.awayPlayerId === null) {
    return 'away';
  }

  return null;
}

// The single next thing to do tonight, walked in match order. Driving the UI from one
// function keeps the CTA, the scoresheet and the routing from disagreeing.
export function nextAction(detail: TeamMatchDetail): NightAction {
  for (let order = 1; order <= MATCHES_PER_NIGHT; order += 1) {
    const match = detail.matches.find((candidate) => candidate.matchOrder === order);

    if (match === undefined) {
      return { kind: 'put-up', matchOrder: order, side: firstPutUpFor(order) };
    }

    const side = sideToPutUp(match);

    if (side !== null) {
      return { kind: 'put-up', matchOrder: order, side };
    }

    if (match.status !== 'complete') {
      return { kind: 'result', matchOrder: order, individualMatchId: match.id };
    }
  }

  if (detail.status !== 'submitted') {
    return { kind: 'submit' };
  }

  return { kind: 'done' };
}

export function isNightComplete(detail: TeamMatchDetail): boolean {
  const action = nextAction(detail);

  return action.kind === 'submit' || action.kind === 'done';
}
