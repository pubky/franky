import * as Core from '@/core';

export interface UseUserDetailsResult {
  /** User details from local database, null if not found, undefined if loading */
  userDetails: Core.NexusUserDetails | null | undefined;
  /** True while the query is loading */
  isLoading: boolean;
}
