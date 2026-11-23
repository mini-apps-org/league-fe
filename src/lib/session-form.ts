import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import type { LeagueSession, SessionInput, SessionPatch } from '@/types/league';

import { SESSION_STATUSES, SESSION_TYPES } from './session-filters';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 60;
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;

// Each message is a key under admin.sessions.form.errors, translated where it is shown.
const SESSION_FORM_ERRORS = [
  'nameRequired',
  'nameTooShort',
  'nameTooLong',
  'duplicateName',
  'type',
  'seasonYear',
  'startsOn',
  'endsOn',
  'endsBeforeStart',
] as const;

export type SessionFormError = (typeof SESSION_FORM_ERRORS)[number];

export const isSessionFormError = (message: string | undefined): message is SessionFormError => {
  return SESSION_FORM_ERRORS.some((error) => error === message);
};

// The year input holds a string, so a half-typed "20" is never coerced to a number early.
export const sessionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'nameRequired')
      .min(NAME_MIN_LENGTH, 'nameTooShort')
      .max(NAME_MAX_LENGTH, 'nameTooLong'),
    sessionType: z.enum(SESSION_TYPES, { error: 'type' }),
    seasonYear: z
      .string()
      .regex(/^\d{4}$/, 'seasonYear')
      .transform(Number)
      .pipe(z.number().min(YEAR_MIN, 'seasonYear').max(YEAR_MAX, 'seasonYear')),
    startsOn: z.iso.date({ error: 'startsOn' }),
    endsOn: z.iso.date({ error: 'endsOn' }),
    status: z.enum(SESSION_STATUSES),
    isActive: z.boolean(),
  })
  .refine(
    (values) => {
      return values.endsOn >= values.startsOn;
    },
    { path: ['endsOn'], message: 'endsBeforeStart' },
  );

export type SessionFormValues = z.input<typeof sessionFormSchema>;

export type SessionFormOutput = z.output<typeof sessionFormSchema>;

// A new session starts with no type, as in the design, so the admin must pick one.
export const getSessionFormValues = (
  session: LeagueSession | undefined,
): DefaultValues<SessionFormValues> => {
  if (session) {
    return {
      name: session.name,
      sessionType: session.sessionType,
      seasonYear: String(session.seasonYear),
      startsOn: session.startsOn,
      endsOn: session.endsOn,
      status: session.status,
      isActive: session.isActive,
    };
  }

  return {
    name: '',
    seasonYear: '',
    startsOn: '',
    endsOn: '',
    status: 'DRAFT',
    isActive: false,
  };
};

// Checked against the cached list before saving; league-be's UNIQUE (league_id, name) is the
// real guard and answers 40901.
export const isDuplicateSessionName = (
  name: string,
  sessions: readonly Pick<LeagueSession, 'id' | 'name'>[],
  editingId: string | undefined,
): boolean => {
  const wanted = name.trim().toLowerCase();

  return sessions.some(
    (session) => session.id !== editingId && session.name.toLowerCase() === wanted,
  );
};

// Only what changed, so an edit never overwrites a field someone else saved meanwhile.
export const getSessionPatch = (session: LeagueSession, input: SessionInput): SessionPatch => {
  const changed = (Object.keys(input) as (keyof SessionInput)[]).filter(
    (key) => input[key] !== session[key],
  );

  return Object.fromEntries(changed.map((key) => [key, input[key]]));
};
