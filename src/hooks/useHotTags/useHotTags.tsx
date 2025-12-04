'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { UseHotTagsParams, UseHotTagsResult, HotTag } from './useHotTags.types';
import { DEFAULT_LIMIT } from './useHotTags.constants';

/**
 * useHotTags
 *
 * Hook for fetching hot/trending tags from the today:all stream.
 * Uses the HotController to fetch tags with cache-first strategy.
 *
 * @param params - Hook parameters
 * @param params.limit - Maximum number of tags to fetch (default: 5)
 * @returns Hot tags array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { tags, isLoading, error } = useHotTags({ limit: 5 });
 *
 * return (
 *   <HotTags tags={tags} />
 * );
 * ```
 */
export function useHotTags({ limit = DEFAULT_LIMIT }: UseHotTagsParams = {}): UseHotTagsResult {
  const [tags, setTags] = useState<HotTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hotTags = await Core.HotController.getOrFetch({
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit,
      });

      // Transform NexusHotTag to HotTag format
      const transformedTags: HotTag[] = hotTags.map((tag) => ({
        name: tag.label,
        count: tag.tagged_count,
      }));

      setTags(transformedTags);
      Libs.Logger.debug('[useHotTags] Fetched hot tags', { count: transformedTags.length });
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to fetch hot tags';
      setError(errorMessage);
      Libs.Logger.error('[useHotTags] Failed to fetch hot tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    refetch: fetchTags,
  };
}
