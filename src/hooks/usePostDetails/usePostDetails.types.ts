import * as Core from '@/core';

export interface UsePostDetailsResult {
  /** Post details from local database, null if not found, undefined if loading */
  postDetails: Core.EnrichedPostDetails | null | undefined;
  /** True while the query is loading */
  isLoading: boolean;
}
