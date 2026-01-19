'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Types from './usePostDetails.types';

/**
 * Hook to get post details from local database with live updates.
 * If the post is not in cache, it will trigger a fetch from Nexus.
 *
 * Separates concerns:
 * 1. useEffect: Ensures data exists (fetch from Nexus if missing)
 * 2. useLiveQuery: Reads current data reactively from local DB
 */
export function usePostDetails(compositeId: string | null | undefined): Types.UsePostDetailsResult {
  // Ensure data exists (fetch-if-missing)
  // This runs once per compositeId and triggers PostController.getOrFetchDetails
  // which handles the cache-or-fetch logic internally
  useEffect(() => {
    if (!compositeId) return;

    // PostController.getOrFetchDetails handles the caching strategy:
    // 1. Check local DB first
    // 2. If missing, fetch from Nexus
    // 3. Write to local DB
    // 4. Return data
    // Note: viewerId is omitted for unauthenticated views - Nexus handles this
    Core.PostController.getOrFetchDetails({ compositeId }).catch((error) => {
      Libs.Logger.error('[usePostDetails] Failed to fetch post details:', { compositeId, error });
    });
  }, [compositeId]);

  // Read current data from local database
  // This will reactively update when the database changes
  const postDetails = useLiveQuery(
    async () => {
      if (!compositeId) return null;
      return await Core.PostController.getDetails({ compositeId });
    },
    [compositeId],
    undefined,
  );

  return {
    postDetails,
    isLoading: postDetails === undefined,
  };
}
