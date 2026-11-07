// Every successful response is wrapped in this envelope by league-be's
// config.SuccessResponse. `count` and `metadata` are null/absent for the auth endpoints.
export interface ApiEnvelope<T> {
  session_id: string;
  count: number | null;
  data: T;
  metadata?: unknown;
}
