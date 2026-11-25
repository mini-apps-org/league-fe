const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// league-be answers any other id, in a path or a filter, with 400001.
export const isUUID = (value: string): boolean => {
  return UUID_PATTERN.test(value);
};

// For an optional id: blank means "none", anything else must be complete.
export const isEmptyOrUUID = (value: string): boolean => {
  return value === '' || isUUID(value);
};
