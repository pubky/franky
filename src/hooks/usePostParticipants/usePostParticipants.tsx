'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type {
  UsePostParticipantsResult,
  UsePostParticipantsOptions,
  PostParticipant,
} from './usePostParticipants.types';

const DEFAULT_LIMIT = 10;

/**
 * Hook for fetching post participants (author + reply authors).
 * Returns unique participants with their user details.
 */
export function usePostParticipants(
  postId: string | null | undefined,
  options: UsePostParticipantsOptions = {},
): UsePostParticipantsResult {
  const { limit = DEFAULT_LIMIT } = options;

  const [replyAuthorIds, setReplyAuthorIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Watch for changes in post_counts to know when replies change
  const postCounts = useLiveQuery(
    () => (postId ? Core.PostController.getPostCounts({ compositeId: postId }) : null),
    [postId],
  );

  // Fetch reply IDs to extract author IDs
  const fetchReplyAuthors = useCallback(async () => {
    if (!postId || !postCounts?.replies || postCounts.replies < 1) {
      setReplyAuthorIds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
      setIsLoading(false);
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

  // Fetch user details for all participants
  const userDetailsMap = useLiveQuery(
    async () => {
      if (participantIds.length === 0) return new Map<string, Core.UserDetailsModelSchema>();

      const details = await Promise.all(
        participantIds.map(async (id) => {
          const userDetails = await Core.UserDetailsModel.findById(id as Core.Pubky);
          return [id, userDetails] as const;
        }),
      );

      return new Map(details.filter(([, d]) => d !== null) as [string, Core.UserDetailsModelSchema][]);
    },
    [participantIds],
    new Map<string, Core.UserDetailsModelSchema>(),
  );

  // Transform to PostParticipant format
  const participants: PostParticipant[] = useMemo(() => {
    return participantIds.map((id) => {
      const details = userDetailsMap.get(id);
      return {
        id,
        name: details?.name ?? undefined,
        image: details?.image ?? undefined,
        avatarUrl: Core.FileController.getAvatarUrl(id as Core.Pubky),
        isFollowing: false, // TODO: Add relationship data if needed
        counts: {
          tags: 0,
          posts: 0,
        },
      };
    });
  }, [participantIds, userDetailsMap]);

  // Extract author from participants
  const author = useMemo(() => {
    if (!authorId) return null;
    return participants.find((p) => p.id === authorId) ?? null;
  }, [participants, authorId]);

  return {
    participants,
    author,
    isLoading: isLoading || userDetailsMap.size === 0,
    error,
  };
}
