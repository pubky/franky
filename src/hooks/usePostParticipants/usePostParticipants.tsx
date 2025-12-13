'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import type {
  UsePostParticipantsResult,
  UsePostParticipantsOptions,
  PostParticipant,
} from './usePostParticipants.types';

const DEFAULT_LIMIT = 10;

/**
 * Hook for fetching post participants (author + reply authors).
 * Returns unique participants with their user details.
 *
 * Reuses:
 * - usePostCounts: for reactive post counts
 * - useBulkUserAvatars: for user details and avatar URLs
 */
export function usePostParticipants(
  postId: string | null | undefined,
  options: UsePostParticipantsOptions = {},
): UsePostParticipantsResult {
  const { limit = DEFAULT_LIMIT } = options;

  const [replyAuthorIds, setReplyAuthorIds] = useState<string[]>([]);
  const [isFetchingReplies, setIsFetchingReplies] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Parse post author from composite ID
  const authorId = useMemo(() => {
    if (!postId) return null;
    try {
      const { pubky } = Core.parseCompositeId(postId);
      return pubky;
    } catch {
      return null;
    }
  }, [postId]);

  // Use existing hook for post counts (reactive)
  const { postCounts } = Hooks.usePostCounts(postId);

  // Fetch reply IDs to extract author IDs
  const fetchReplyAuthors = useCallback(async () => {
    if (!postId || !postCounts?.replies || postCounts.replies < 1) {
      setReplyAuthorIds([]);
      setIsFetchingReplies(false);
      return;
    }

    try {
      setIsFetchingReplies(true);
      const response = await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId: `${Core.StreamSource.REPLIES}:${postId}`,
        streamTail: 0,
        lastPostId: undefined,
        limit: Math.min(postCounts.replies, limit * 2), // Fetch more to account for duplicates
      });

      // Extract unique author IDs from reply composite IDs
      const authorIds = new Set<string>();
      for (const replyId of response.nextPageIds) {
        try {
          const { pubky } = Core.parseCompositeId(replyId);
          if (pubky !== authorId) {
            // Don't include post author in reply authors
            authorIds.add(pubky);
          }
        } catch {
          // Skip invalid IDs
        }
      }

      setReplyAuthorIds(Array.from(authorIds).slice(0, limit - 1)); // Leave room for author
      setError(null);
    } catch (err) {
      Libs.Logger.error('Failed to fetch reply authors:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch participants'));
      setReplyAuthorIds([]);
    } finally {
      setIsFetchingReplies(false);
    }
  }, [postId, postCounts?.replies, authorId, limit]);

  useEffect(() => {
    fetchReplyAuthors();
  }, [fetchReplyAuthors]);

  // Combine author + reply authors (unique)
  const participantIds = useMemo(() => {
    const ids: string[] = [];
    if (authorId) {
      ids.push(authorId);
    }
    for (const id of replyAuthorIds) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    return ids.slice(0, limit);
  }, [authorId, replyAuthorIds, limit]);

  // Use existing hook for bulk user avatars and details
  const { usersMap, isLoading: isLoadingUsers } = Hooks.useBulkUserAvatars(participantIds as Core.Pubky[]);

  // Transform to PostParticipant format
  const participants: PostParticipant[] = useMemo(() => {
    return participantIds.map((id) => {
      const userWithAvatar = usersMap.get(id as Core.Pubky);
      return {
        id,
        name: userWithAvatar?.name,
        avatarUrl: userWithAvatar?.avatarUrl,
        isFollowing: false, // Relationship handled by SinglePostParticipants via useIsFollowing
        counts: {
          tags: 0,
          posts: 0,
        },
      };
    });
  }, [participantIds, usersMap]);

  // Extract author from participants
  const author = useMemo(() => {
    if (!authorId) return null;
    return participants.find((p) => p.id === authorId) ?? null;
  }, [participants, authorId]);

  const isLoading = isFetchingReplies || isLoadingUsers;

  return {
    participants,
    author,
    isLoading,
    error,
  };
}
