'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { UseUserStreamParams, UseUserStreamResult, UserStreamUser } from './useUserStream.types';
import { DEFAULT_USER_STREAM_LIMIT } from './useUserStream.constants';

/**
 * useUserStream
 *
 * Hook for fetching users from a user stream (e.g., influencers, recommended).
 * Uses StreamUserController for fetching IDs and useLiveQuery for reactive details/counts.
 *
 * @param params - Hook parameters
 * @param params.streamId - Stream ID to fetch (e.g., UserStreamTypes.TODAY_INFLUENCERS_ALL)
 * @param params.limit - Maximum number of users to fetch (default: 3)
 * @param params.includeCounts - Whether to also fetch user counts (default: false)
 * @returns Users array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { users, isLoading } = useUserStream({
 *   streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
 *   limit: 3,
 *   includeCounts: true,
 * });
 * ```
 */
export function useUserStream({
  streamId,
  limit = DEFAULT_USER_STREAM_LIMIT,
  includeCounts = false,
  includeRelationships = false,
}: UseUserStreamParams): UseUserStreamResult {
  const [userIds, setUserIds] = useState<Core.Pubky[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reactive user details from local database
  const userDetailsMap = useLiveQuery(
    async () => {
      if (userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserDetails>();
      return await Core.UserController.bulkGetDetails(userIds);
    },
    [userIds],
    new Map<Core.Pubky, Core.NexusUserDetails>(),
  );

  // Reactive user counts from local database (only if includeCounts is true)
  const userCountsMap = useLiveQuery(
    async () => {
      if (!includeCounts || userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserCounts>();
      return await Core.UserController.bulkGetCounts(userIds);
    },
    [userIds, includeCounts],
    new Map<Core.Pubky, Core.NexusUserCounts>(),
  );

  // Reactive user relationships from local database (only if includeRelationships is true)
  const userRelationshipsMap = useLiveQuery(
    async () => {
      if (!includeRelationships || userIds.length === 0)
        return new Map<Core.Pubky, Core.UserRelationshipsModelSchema>();
      return await Core.UserController.bulkGetRelationships(userIds);
    },
    [userIds, includeRelationships],
    new Map<Core.Pubky, Core.UserRelationshipsModelSchema>(),
  );

  // Combine userIds with details, counts, and relationships
  const users = useMemo((): UserStreamUser[] => {
    const result: UserStreamUser[] = [];

    for (const id of userIds) {
      const details = userDetailsMap.get(id);
      if (!details) continue;

      const counts = userCountsMap.get(id);
      const relationship = userRelationshipsMap.get(id);

      result.push({
        id: details.id,
        name: details.name,
        bio: details.bio,
        image: details.image,
        status: details.status,
        counts: counts
          ? {
              posts: counts.posts,
              tags: counts.tags,
              followers: counts.followers,
              following: counts.following,
            }
          : undefined,
        isFollowing: relationship?.following ?? false,
      });
    }

    return result;
  }, [userIds, userDetailsMap, userCountsMap, userRelationshipsMap]);

  // Fetch user IDs from the stream
  const fetchUserIds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { nextPageIds } = await Core.StreamUserController.getOrFetchStreamSlice({
        streamId,
        limit,
        skip: 0,
      });

      setUserIds(nextPageIds);
      Libs.Logger.debug('[useUserStream] Fetched user IDs', { streamId, count: nextPageIds.length });
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      Libs.Logger.error('[useUserStream] Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [streamId, limit]);

  useEffect(() => {
    void fetchUserIds();
  }, [fetchUserIds]);

  return {
    users,
    userIds,
    isLoading,
    error,
    refetch: fetchUserIds,
  };
}
