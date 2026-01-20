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
  includeTags = false,
}: UseUserStreamParams): UseUserStreamResult {
  const [userIds, setUserIds] = useState<Core.Pubky[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTagsMap, setUserTagsMap] = useState<Map<Core.Pubky, Core.NexusTag[]>>(new Map());

  // Reactive user details from local database
  const userDetailsMap = useLiveQuery(
    async () => {
      try {
        if (userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserDetails>();
        return await Core.UserController.getManyDetails({ userIds });
      } catch (error) {
        Libs.Logger.error('[useUserStream] Failed to query user details', { userIds, error });
        return new Map<Core.Pubky, Core.NexusUserDetails>();
      }
    },
    [userIds],
    new Map<Core.Pubky, Core.NexusUserDetails>(),
  );

  // Reactive user counts from local database (only if includeCounts is true)
  const userCountsMap = useLiveQuery(
    async () => {
      try {
        if (!includeCounts || userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserCounts>();
        return await Core.UserController.getManyCounts({ userIds });
      } catch (error) {
        Libs.Logger.error('[useUserStream] Failed to query user counts', { userIds, error });
        return new Map<Core.Pubky, Core.NexusUserCounts>();
      }
    },
    [userIds, includeCounts],
    new Map<Core.Pubky, Core.NexusUserCounts>(),
  );

  // Reactive user relationships from local database (only if includeRelationships is true)
  const userRelationshipsMap = useLiveQuery(
    async () => {
      try {
        if (!includeRelationships || userIds.length === 0)
          return new Map<Core.Pubky, Core.UserRelationshipsModelSchema>();
        return await Core.UserController.getManyRelationships({ userIds });
      } catch (error) {
        Libs.Logger.error('[useUserStream] Failed to query user relationships', { userIds, error });
        return new Map<Core.Pubky, Core.UserRelationshipsModelSchema>();
      }
    },
    [userIds, includeRelationships],
    new Map<Core.Pubky, Core.UserRelationshipsModelSchema>(),
  );

  // Fetch user tags (local-first with API fallback for missing)
  useEffect(() => {
    if (!includeTags || userIds.length === 0) {
      setUserTagsMap(new Map());
      return;
    }

    const fetchTags = async () => {
      try {
        const tagsMap = await Core.UserController.getManyTagsOrFetch({ userIds });
        setUserTagsMap(tagsMap);
      } catch (err) {
        Libs.Logger.error('[useUserStream] Failed to fetch user tags:', err);
        setUserTagsMap(new Map());
      }
    };

    void fetchTags();
  }, [userIds, includeTags]);

  // Combine userIds with details, counts, relationships, and tags
  const users = useMemo((): UserStreamUser[] => {
    const result: UserStreamUser[] = [];

    for (const id of userIds) {
      const details = userDetailsMap.get(id);
      if (!details) continue;

      const counts = userCountsMap.get(id);
      const relationship = userRelationshipsMap.get(id);
      const userTags = userTagsMap.get(id);
      // Only compute CDN avatar URL if user has an image set
      const avatarUrl = details.image ? Core.FileController.getAvatarUrl(id) : null;

      result.push({
        id: details.id,
        name: details.name,
        bio: details.bio,
        image: details.image,
        avatarUrl,
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
        tags: userTags?.map((tag) => tag.label),
      });
    }

    return result;
  }, [userIds, userDetailsMap, userCountsMap, userRelationshipsMap, userTagsMap]);

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
