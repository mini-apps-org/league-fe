import { z } from 'zod';

import { isEmptyOrUUID, isUUID } from '@/lib/uuid';

// league-be's teamCodePattern (XXyyA), checked after upper-casing as the server does.
const TEAM_CODE_PATTERN = /^[0-9A-Z]{5}$/;

// league-be's maxTeamNameLength.
const MAX_TEAM_NAME_LENGTH = 100;

// Zod messages are these ids; the form translates them as `teams.form.errors.<id>`.
export const TEAM_FORM_ERRORS = [
  'teamCode',
  'duplicateCode',
  'nameRequired',
  'nameTooLong',
  'divisionId',
  'id',
  'targetTeam',
] as const;

export type TeamFormError = (typeof TEAM_FORM_ERRORS)[number];

export const isTeamFormError = (message: string | undefined): message is TeamFormError => {
  return TEAM_FORM_ERRORS.some((error) => error === message);
};

const isTeamCode = (value: string): boolean => {
  return TEAM_CODE_PATTERN.test(value.toUpperCase());
};

const teamCode = z.string().trim().refine(isTeamCode, { error: 'teamCode' });

const teamName = z
  .string()
  .trim()
  .min(1, { error: 'nameRequired' })
  .max(MAX_TEAM_NAME_LENGTH, { error: 'nameTooLong' });

const optionalId = z.string().trim().refine(isEmptyOrUUID, { error: 'id' });

export const createTeamSchema = z.object({
  division_id: z.string().trim().refine(isUUID, { error: 'divisionId' }),
  venue_id: optionalId,
  team_code: teamCode,
  name: teamName,
});

export type CreateTeamValues = z.infer<typeof createTeamSchema>;

// The captain is picked from the roster, so it is never typed and needs no check here.
export const editTeamSchema = z.object({
  team_code: teamCode,
  name: teamName,
  captain_player_id: z.string(),
  venue_id: optionalId,
});

export type EditTeamValues = z.infer<typeof editTeamSchema>;

export const playerIdSchema = z.object({
  player_id: z.string().trim().refine(isUUID, { error: 'id' }),
});

export type PlayerIdValues = z.infer<typeof playerIdSchema>;

export const divisionIdSchema = z.object({
  division_id: z.string().trim().refine(isUUID, { error: 'divisionId' }),
});

export type DivisionIdValues = z.infer<typeof divisionIdSchema>;

// division_id empty keeps the player in their current division.
export const transferSchema = z.object({
  team_id: z.string().refine(isUUID, { error: 'targetTeam' }),
  division_id: optionalId,
});

export type TransferValues = z.infer<typeof transferSchema>;
