'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';
import type { ConnectionType, UserConnectionData, UseProfileConnectionsResult } from './useProfileConnections.types';

export type { ConnectionType, UserConnectionData, UseProfileConnectionsResult };
export { CONNECTION_TYPE } from './useProfileConnections.types';

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useProfileConnections
 *
 * Hook for fetching and managing profile connections (followers, following, friends).
 * Uses Core StreamUserController for pagination and Dexie for reactive user details.
 *
 * @param type - Type of connections to fetch: 'followers', 'following', or 'friends'
 * @param userId - Optional user ID (defaults to current authenticated user)
 * @returns Connections array with full user details, pagination state, and handlers
 *
 * @example
 * ```tsx
 * const { connections, isLoading, loadMore, hasMore } = useProfileConnections(
 *   CONNECTION_TYPE.FOLLOWERS
 * );
 * ```
 */
export function useProfileConnections(type: ConnectionType, userId?: Core.Pubky): UseProfileConnectionsResult {
  // Get current user from auth store if userId not provided
  const { currentUserPubky } = Core.useAuthStore();
  const targetUserId = userId ?? currentUserPubky;

  // State for user IDs (pagination)
  const [userIds, setUserIds] = useState<Core.Pubky[]>([]);
  const [skip, setSkip] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs for stable callbacks
  const userIdsRef = useRef<Core.Pubky[]>([]);

  // Build stream ID: userId:connectionType (e.g., 'user123:followers')
  const streamId = targetUserId ? (`${targetUserId}:${type}` as Core.UserStreamCompositeId) : null;

  // Subscribe to user details from local database (reactive via Controller)
  const userDetailsMap = useLiveQuery(
    async () => {
      if (userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserDetails>();
      return await Core.UserController.bulkGetDetails(userIds);
    },
    [userIds],
    new Map<Core.Pubky, Core.NexusUserDetails>(),
  );

  // Subscribe to user counts from local database (reactive via Controller)
  const userCountsMap = useLiveQuery(
    async () => {
      if (userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserCounts>();
      return await Core.UserController.bulkGetCounts(userIds);
    },
    [userIds],
    new Map<Core.Pubky, Core.NexusUserCounts>(),
  );

  // Subscribe to relationships from local database (reactive via Controller)
  // This tracks whether the current user is following each connection
  const userRelationshipsMap = useLiveQuery(
    async () => {
      if (userIds.length === 0) return new Map<Core.Pubky, Core.UserRelationshipsModelSchema>();
      return await Core.UserController.bulkGetRelationships(userIds);
    },
    [userIds],
    new Map<Core.Pubky, Core.UserRelationshipsModelSchema>(),
  );

  // Combine user IDs with their details and computed avatar URLs
  const connections = useMemo((): UserConnectionData[] => {
    return userIds.map((id) => {
      const details = userDetailsMap.get(id);
      const counts = userCountsMap.get(id);
      const relationship = userRelationshipsMap.get(id);
      // Only compute CDN avatar URL if user has an image set
      const avatarUrl = details?.image ? Core.FileController.getAvatarUrl(id) : null;

      if (!details) {
        // Return minimal data if details not yet loaded
        return {
          id,
          name: '',
          bio: '',
          image: null,
          status: null,
          links: null,
          indexed_at: 0,
          avatarUrl: null,
          tags: [],
          stats: { tags: 0, posts: 0 },
          isFollowing: relationship?.following ?? false,
        } as UserConnectionData;
      }

      return {
        ...details,
        avatarUrl,
        tags: [], // TODO: Fetch tags when available
        stats: {
          tags: counts?.unique_tags ?? 0,
          posts: counts?.posts ?? 0,
        },
        isFollowing: relationship?.following ?? false,
      } as UserConnectionData;
    });
    // Note: We no longer filter out users with empty names - they will appear
    // with placeholder data while their details are being fetched in background
  }, [userIds, userDetailsMap, userCountsMap, userRelationshipsMap]);

  /**
   * Fetches a slice from the user stream
   */
  const fetchStreamSlice = useCallback(
    async (isInitialLoad: boolean) => {
      if (!streamId) {
        setIsLoading(false);
        return;
      }

      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const currentSkip = isInitialLoad ? 0 : skip;

        const result = await Core.StreamUserController.getOrFetchStreamSlice({
          streamId,
          skip: currentSkip,
          limit: Config.NEXUS_USERS_PER_PAGE,
        });

        // Handle empty results
        if (result.nextPageIds.length === 0) {
          Libs.Logger.debug('[useProfileConnections] Empty result, no more connections');
          setHasMore(false);
          return;
        }

        // Deduplicate user IDs
        const existingIds = new Set(userIdsRef.current);
        const newUniqueIds = result.nextPageIds.filter((id) => !existingIds.has(id));

        // Update skip cursor for next pagination
        const nextSkip = result.skip ?? currentSkip + result.nextPageIds.length;
        setSkip(nextSkip);

        // Check hasMore based on response length
        const hasMoreConnections = result.nextPageIds.length >= Config.NEXUS_USERS_PER_PAGE;
        setHasMore(hasMoreConnections);

        // Update state with all IDs (including duplicates for cursor tracking)
        const updatedIds = isInitialLoad ? result.nextPageIds : [...userIdsRef.current, ...newUniqueIds];
        userIdsRef.current = updatedIds;
        setUserIds(updatedIds);
      } catch (err) {
        const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to fetch connections';
        setError(errorMessage);
        setHasMore(false);
        Libs.Logger.error('[useProfileConnections] Failed to fetch stream slice:', err);
      } finally {
        if (isInitialLoad) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [streamId, skip],
  );

  /**
   * Clears all state
   */
  const clearState = useCallback(() => {
    userIdsRef.current = [];
    setUserIds([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
  }, []);

  /**
   * Refresh function - clears state and fetches from beginning
   */
  const refresh = useCallback(async () => {
    clearState();
    await fetchStreamSlice(true);
  }, [clearState, fetchStreamSlice]);

  /**
   * Load more function - fetches next page
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchStreamSlice(false);
  }, [isLoadingMore, hasMore, fetchStreamSlice]);

  // Initial load and reset when streamId changes
  useEffect(() => {
    clearState();
    fetchStreamSlice(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  return {
    connections,
    count: connections.length,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
