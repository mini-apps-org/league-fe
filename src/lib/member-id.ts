// A league card number. Digits only — people read them aloud and type them with spaces.
//
// ASSUMPTION: 8 digits. The original prompt asserts it and the seed uses it, but the schema
// has `member_id TEXT NOT NULL UNIQUE` with no length constraint, so this is unconfirmed.
// It drives the input's maxLength and when the preview fires automatically; a shorter id can
// still be previewed on blur, so a league numbering differently is not locked out.
export const MEMBER_ID_LENGTH = 8;

// Below this there is nothing worth asking the server about.
const MEMBER_ID_MIN_LENGTH = 4;

export function normalizeMemberId(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, MEMBER_ID_LENGTH);
}

// Long enough to look up. Deliberately not "exactly MEMBER_ID_LENGTH": see the assumption.
export function isLookupableMemberId(value: string): boolean {
  return value.length >= MEMBER_ID_MIN_LENGTH;
}

export function isCompleteMemberId(value: string): boolean {
  return value.length === MEMBER_ID_LENGTH;
}
