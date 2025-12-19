'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { UseUnreadPostsOptions, UseUnreadPostsResult } from './useUnreadPosts.types';

/**
 * useUnreadPosts
 *
 * Hook to reactively watch unread posts for a specific stream.
 * Uses Dexie's useLiveQuery to automatically re-render when the
 * unread_post_streams table is updated by the StreamCoordinator.
 *
 * @param options - Options containing the streamId to watch
 * @returns Object with unreadPostIds array and unreadCount
 *
 * @example
 * ```tsx
 * const { unreadPostIds, unreadCount } = useUnreadPosts({ streamId });
 *
 * if (unreadCount > 0) {
 *   // Show "X new posts" button
 * }
 * ```
 */
export function useUnreadPosts({ streamId }: UseUnreadPostsOptions): UseUnreadPostsResult {
  const unreadStream = useLiveQuery(async () => {
    if (!streamId) return null;
    return await Core.StreamPostsController.getUnreadStream({ streamId });
  }, [streamId]);

  return {
    unreadPostIds: unreadStream?.stream ?? [],
    unreadCount: unreadStream?.stream?.length ?? 0,
  };
}
