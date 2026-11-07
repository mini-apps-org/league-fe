// league-be's config.SuccessResponse. `count`/`metadata` are null for the auth endpoints.
export interface ApiEnvelope<T> {
  session_id: string;
  count: number | null;
  data: T;
  metadata?: unknown;
}
