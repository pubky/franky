'use client';

import { useCallback, useMemo } from 'react';
import * as Core from '@/core';
import { useTagged } from '../useTagged';
import { usePostTags } from '../usePostTags';
import type { UseEntityTagsOptions, UseEntityTagsResult } from './useEntityTags.types';

/**
 * Unified hook for fetching and managing entity tags (USER or POST).
 * Automatically selects the appropriate underlying hook based on taggedKind.
 *
 * @param entityId - The ID of the tagged entity (userId or postId)
 * @param taggedKind - The kind of entity (USER or POST)
 * @param options - Configuration options
 * @returns Tag data and handlers
 *
 * @example
 * ```tsx
 * // For user tags
 * const { tags, handleTagToggle } = useEntityTags(userId, Core.TagKind.USER);
 *
 * // For post tags
 * const { tags, handleTagToggle } = useEntityTags(postId, Core.TagKind.POST);
 * ```
 */
export function useEntityTags(
  entityId: string | null | undefined,
  taggedKind: Core.TagKind,
  options: UseEntityTagsOptions = {},
): UseEntityTagsResult {
  const { viewerId: customViewerId, providedTags } = options;

  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const viewerId = customViewerId ?? currentUserId;

  // Use the appropriate hook based on kind
  const userTagsResult = useTagged(taggedKind === Core.TagKind.USER ? entityId : null, {
    viewerId: customViewerId,
    enablePagination: false,
    enableStats: false,
  });

  const postTagsResult = usePostTags(taggedKind === Core.TagKind.POST ? entityId : null, {
    viewerId: customViewerId,
  });

  // Select the active result based on kind
  const activeResult = taggedKind === Core.TagKind.USER ? userTagsResult : postTagsResult;

  // Use provided tags if available, otherwise use fetched tags
  const tags = useMemo(() => {
    if (providedTags) return providedTags;
    return activeResult.tags;
  }, [providedTags, activeResult.tags]);

  // Helper to check if viewer is a tagger
  const isViewerTagger = useCallback(
    (tag: Core.NexusTag): boolean => {
      if (!viewerId) return false;
      return tag.relationship ?? tag.taggers?.includes(viewerId) ?? false;
    },
    [viewerId],
  );

  // Wrap handleTagToggle to work with NexusTag directly
  const handleTagToggle = useCallback(
    async (tag: Core.NexusTag): Promise<void> => {
      await activeResult.handleTagToggle({
        label: tag.label,
        relationship: isViewerTagger(tag),
      });
    },
    [activeResult, isViewerTagger],
  );

  return {
    tags,
    count: activeResult.count,
    isLoading: activeResult.isLoading,
    isViewerTagger,
    handleTagToggle,
    handleTagAdd: activeResult.handleTagAdd,
  };
}
