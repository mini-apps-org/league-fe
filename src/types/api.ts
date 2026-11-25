// league-be's handler.Metadata, sent on list responses only. A paged list sends `total` on its
// first page only and `next_cursor` on every page but the last; a list returned whole sends
// just `count`, with `has_more` false.
export interface ApiMetadata {
  count: number;
  total?: number;
  has_more: boolean;
  next_cursor?: string;
}

// league-be's handler.SuccessResponse, the body of every successful response.
export interface ApiEnvelope<T> {
  data: T;
  metadata?: ApiMetadata;
}

// One page of a cursor-paged list, where `metadata` is always present.
export type ApiPage<T> = Required<ApiEnvelope<T[]>>;
