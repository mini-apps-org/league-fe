import type { Role } from '@/types/league';

// Mirrors league-be's auth.UserResponse. Note the wire format here is **camelCase**
// (`avatarUrl`), set by the json tags in internal/auth/model_handlers.go — not the
// snake_case used by the envelope's own fields.
export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  // Derived server-side from users_roles; always present as of phase 3. Still read through
  // roleOf() so a missing user resolves to the least privilege rather than crashing.
  role: Role;
  // The league player this account has claimed, or null when it has claimed none.
  //
  // Absent (undefined) and null mean different things on purpose: undefined is "the API does
  // not send this field yet", null is "it does, and this account is unlinked". The gate acts
  // only on null, so shipping this UI before the endpoint cannot strand every user on the
  // linking screen.
  playerId?: string | null;
}

// Least privilege when the server has not said otherwise. The frontend uses the role only to
// hide controls — league-be enforces it, and a hidden button is not a permission check.
export function roleOf(user: User | undefined): Role {
  return user?.role ?? 'player';
}

// True only when the API has said, explicitly, that this account has claimed no player.
export function needsMemberLink(user: User | undefined): boolean {
  return user !== undefined && user.playerId === null;
}

export interface MeResponse {
  user: User;
}
