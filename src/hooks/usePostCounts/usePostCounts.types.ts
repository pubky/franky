import * as Core from '@/core';

export interface UsePostCountsResult {
  /** Post counts from local database, null if not found, undefined if loading */
  postCounts: Core.PostCountsModelSchema | null | undefined;
  /** True while the query is loading */
  isLoading: boolean;
}
