import { z } from 'zod';

import { SKILL_LEVEL_MAX, SKILL_LEVEL_MIN } from './rules';

// Mirrors what the database rejects, so the user finds out before the request rather than
// from a 400 after they have typed everything else.
export const resultSchema = z
  .object({
    homeGames: z.number().int().min(0),
    awayGames: z.number().int().min(0),
    homeRace: z.number().int().positive(),
    awayRace: z.number().int().positive(),
    innings: z.number().int().min(0),
    homeDefShots: z.number().int().min(0),
    awayDefShots: z.number().int().min(0),
  })
  .refine((value) => {
    return value.homeGames <= value.homeRace && value.awayGames <= value.awayRace;
  })
  // Exactly one player must have reached their race: neither means the match is unfinished,
  // both is impossible.
  .refine((value) => {
    const homeWon = value.homeGames >= value.homeRace;
    const awayWon = value.awayGames >= value.awayRace;

    return homeWon !== awayWon;
  });

// change_skill_level() rejects an out-of-range level and a blank reason; both are checked
// here too so the save button can stay disabled instead of failing.
export const skillLevelChangeSchema = z.object({
  newSkillLevel: z.number().int().min(SKILL_LEVEL_MIN).max(SKILL_LEVEL_MAX),
  reason: z.string().trim().min(1),
});

export type SkillLevelChangeInput = z.infer<typeof skillLevelChangeSchema>;
