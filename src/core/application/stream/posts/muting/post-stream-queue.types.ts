import { TPostStreamChunkResponse } from '../post.types';

export type FetchResult = TPostStreamChunkResponse;
export type FetchFn = (cursor: number) => Promise<FetchResult>;
export type FilterFn = (posts: string[]) => string[] | Promise<string[]>;

export interface CollectParams {
  limit: number;
  cursor: number;
  filter: FilterFn;
  fetch: FetchFn;
}

export interface CollectResult {
  posts: string[];
  cacheMissIds: string[];
  cursor: number;
  timestamp: number | undefined;
  /** True only if Nexus returned fewer posts than limit (actual end of stream).
   * False if we hit MAX_FETCH_ITERATIONS or filled the limit. */
  reachedEnd: boolean;
}
