'use client';

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
 * Uses liveQuery to reactively get participants from local cache.
 *
 * Flow:
 * 1. Query post_relationships table for posts where replied === postId
 * 2. Extract unique author IDs from those reply composite IDs
 * 3. Use useBulkUserAvatars for user details (cache-first with Nexus fallback)
 */
export function usePostParticipants(
  postId: string | null | undefined,
  options: UsePostParticipantsOptions = {},
): UsePostParticipantsResult {
  const { limit = DEFAULT_LIMIT } = options;

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

  // Use liveQuery to get replies from local cache (reactive)
  const replyRelationships = useLiveQuery(
    async () => {
      try {
        if (!postId) return [];
        return await Core.PostController.getReplies({ compositeId: postId });
      } catch (error) {
        Libs.Logger.error('[usePostParticipants] Failed to query post replies', { postId, error });
        return [];
      }
    },
    [postId],
    [],
  );

  // Extract unique author IDs from reply composite IDs
  const participantIds = useMemo(() => {
    const ids = new Set<string>();

    // Add post author first
    if (authorId) {
      ids.add(authorId);
    }

    // Extract authors from replies
    for (const reply of replyRelationships) {
      try {
        const { pubky } = Core.parseCompositeId(reply.id);
        ids.add(pubky);
      } catch {
        // Skip invalid IDs
      }
    }

    return Array.from(ids).slice(0, limit);
  }, [authorId, replyRelationships, limit]);

  // Use existing hook for bulk user avatars and details (cache-first)
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

  return {
    participants,
    author,
    isLoading: isLoadingUsers,
    error: null,
  };
}
