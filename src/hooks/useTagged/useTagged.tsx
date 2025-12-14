'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
// Import directly to avoid circular dependency with @/hooks barrel
import { useProfileStats } from '@/hooks/useProfileStats';
import { toast } from '@/molecules/Toaster/use-toast';
import type { UseTaggedResult, UseTaggedOptions } from './useTagged.types';
import { transformTagsForViewer } from '@/molecules/TaggedItem/TaggedItem.utils';
import { TAGS_PER_PAGE } from './useTagged.constants';

/**
 * Unified hook for fetching and managing user tags.
 * Uses useLiveQuery on IndexedDB for automatic reactivity across all instances.
 *
 * The TagController.create/delete methods follow local-first pattern:
 * they update IndexedDB first, then sync to server.
 * This means useLiveQuery will react immediately to changes.
 */
export function useTagged(userId: string | null | undefined, options: UseTaggedOptions = {}): UseTaggedResult {
  const { enablePagination = true, enableStats = true, viewerId: customViewerId } = options;

  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const viewerId = customViewerId ?? currentUserId;

  // Track zero-tagger tags with their original index for order preservation
  const [zeroTaggerTags, setZeroTaggerTags] = useState<Map<string, { tag: Core.NexusTag; index: number }>>(new Map());

  // Track the order of tags as they were originally loaded
  const [tagOrder, setTagOrder] = useState<Map<string, number>>(new Map());

  // Only fetch stats if enabled
  const { stats, isLoading: isLoadingStats } = useProfileStats(enableStats ? (userId ?? '') : '');

  // Fetch tags directly from IndexedDB - this will react to any changes made by TagController
  const localTags = useLiveQuery(async () => {
    if (!userId) return undefined;
    const tags = await Core.UserController.getUserTags(userId);
    return tags.length > 0 ? tags : null;
  }, [userId]);

  // Update tag order map when localTags change (only for new tags)
  useEffect(() => {
    if (!localTags) return;

    setTagOrder((prevOrder) => {
      let hasChanges = false;
      const newOrder = new Map(prevOrder);

      localTags.forEach((tag) => {
        const labelLower = tag.label.toLowerCase();
        if (!newOrder.has(labelLower)) {
          newOrder.set(labelLower, newOrder.size);
          hasChanges = true;
        }
      });

      return hasChanges ? newOrder : prevOrder;
    });
  }, [localTags]);

  // Track if we've already fetched from server for this user
  const [hasFetched, setHasFetched] = useState(false);
  const prevUserIdRef = useRef<string | null | undefined>(null);

  // Reset hasFetched when userId changes
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      setHasFetched(false);
      prevUserIdRef.current = userId;
    }
  }, [userId]);

  // Initial fetch from server (always fetch to ensure we have all tags)
  useEffect(() => {
    if (!userId || hasFetched) return;

    const fetchTags = async () => {
      try {
        // Fetch from server
        const fetchedTags = await Core.UserController.tags({
          user_id: userId,
          viewer_id: viewerId ?? undefined,
          ...(enablePagination && { limit_tags: TAGS_PER_PAGE, skip_tags: 0 }),
        });

        // Save to IndexedDB so useLiveQuery reacts
        await Core.UserController.saveUserTags(userId, fetchedTags);

        setHasFetched(true);
      } catch {
        // Ignore fetch errors - we'll show empty state
        setHasFetched(true);
      }
    };

    fetchTags();
  }, [userId, viewerId, enablePagination, hasFetched]);

  // Combine local tags with zero-tagger tags, preserving order
  const allTags = useMemo(() => {
    const baseTags = localTags ?? [];
    const baseTagLabels = new Set(baseTags.map((t) => t.label.toLowerCase()));

    // Get zero-tagger tags that aren't in baseTags
    const zeroTagsToAdd: Array<{ tag: Core.NexusTag; index: number }> = [];
    zeroTaggerTags.forEach((value, label) => {
      if (!baseTagLabels.has(label)) {
        zeroTagsToAdd.push(value);
      }
    });

    if (zeroTagsToAdd.length === 0) {
      return baseTags;
    }

    // Merge and sort by original index
    const allTagsWithIndex = [
      ...baseTags.map((tag) => ({
        tag,
        index: tagOrder.get(tag.label.toLowerCase()) ?? Infinity,
      })),
      ...zeroTagsToAdd,
    ];

    // Sort by original index to preserve order
    allTagsWithIndex.sort((a, b) => a.index - b.index);

    return allTagsWithIndex.map((item) => item.tag);
  }, [localTags, zeroTaggerTags, tagOrder]);

  const handleTagAdd = useCallback(
    async (tagString: string): Promise<{ success: boolean; error?: string }> => {
      const label = tagString.trim();

      if (!label) return { success: false, error: 'Tag label cannot be empty' };
      if (!userId) return { success: false, error: 'User ID is required' };
      if (!viewerId) return { success: false, error: 'You must be logged in to add tags' };

      // Check if user already tagged
      const existingTag = allTags.find((t) => t.label.toLowerCase() === label.toLowerCase());
      if (existingTag?.taggers?.includes(viewerId)) {
        return { success: false, error: 'You have already added this tag' };
      }

      try {
        // TagController.create updates IndexedDB first (local-first), then syncs to server
        // useLiveQuery will automatically react to the IndexedDB change
        await Core.TagController.create({
          taggedId: userId as Core.Pubky,
          label,
          taggerId: viewerId,
          taggedKind: Core.TagKind.USER,
        });

        // Remove from zero-tagger list if it was there
        const labelLower = label.toLowerCase();
        setZeroTaggerTags((prev) => {
          const next = new Map(prev);
          next.delete(labelLower);
          return next;
        });

        return { success: true };
      } catch {
        toast({
          title: 'Failed to add tag',
          description: `Could not add "${label}". Please try again.`,
        });
        return { success: false, error: 'Failed to add tag' };
      }
    },
    [userId, viewerId, allTags],
  );

  const handleTagToggle = useCallback(
    async (tag: { label: string; relationship?: boolean }): Promise<void> => {
      if (!userId || !viewerId) return;

      const currentTagIndex = allTags.findIndex((t) => t.label === tag.label);
      const currentTag = currentTagIndex >= 0 ? allTags[currentTagIndex] : undefined;
      // Use relationship from tag (from transformTagsForViewer) which is more reliable
      // than checking the taggers array which may be truncated
      const userIsTagger =
        tag.relationship ?? currentTag?.relationship ?? currentTag?.taggers?.includes(viewerId) ?? false;
      const labelLower = tag.label.toLowerCase();

      try {
        if (userIsTagger) {
          // Track zero-tagger tag BEFORE delete to preserve order
          if (currentTag && (currentTag.taggers_count ?? 0) <= 1) {
            const originalIndex = tagOrder.get(labelLower) ?? currentTagIndex;
            const zeroTag: Core.NexusTag = {
              ...currentTag,
              taggers: [],
              taggers_count: 0,
              relationship: false,
            };
            setZeroTaggerTags((prev) => {
              const next = new Map(prev);
              next.set(labelLower, { tag: zeroTag, index: originalIndex });
              return next;
            });
          }

          // TagController.delete updates IndexedDB first (local-first), then syncs to server
          await Core.TagController.delete({
            taggedId: userId as Core.Pubky,
            label: tag.label,
            taggerId: viewerId,
            taggedKind: Core.TagKind.USER,
          });
        } else {
          // TagController.create updates IndexedDB first (local-first), then syncs to server
          await Core.TagController.create({
            taggedId: userId as Core.Pubky,
            label: tag.label,
            taggerId: viewerId,
            taggedKind: Core.TagKind.USER,
          });

          // Remove from zero-tagger list
          setZeroTaggerTags((prev) => {
            const next = new Map(prev);
            next.delete(labelLower);
            return next;
          });
        }
      } catch {
        // Rollback zero-tagger state on error
        if (userIsTagger) {
          setZeroTaggerTags((prev) => {
            const next = new Map(prev);
            next.delete(labelLower);
            return next;
          });
        }
        toast({
          title: userIsTagger ? 'Failed to remove tag' : 'Failed to add tag',
          description: `Could not ${userIsTagger ? 'remove' : 'add'} "${tag.label}". Please try again.`,
        });
      }
    },
    [userId, viewerId, allTags, tagOrder],
  );

  // Pagination
  const hasMore = enablePagination && allTags.length >= TAGS_PER_PAGE;

  const loadMore = useCallback(async () => {
    if (!enablePagination || !userId || !hasMore) return;

    try {
      const moreTags = await Core.UserController.tags({
        user_id: userId,
        viewer_id: viewerId ?? undefined,
        limit_tags: TAGS_PER_PAGE,
        skip_tags: allTags.length,
      });

      // Merge with existing tags and save to IndexedDB
      if (moreTags.length > 0) {
        const existingLabels = new Set(allTags.map((t) => t.label.toLowerCase()));
        const newTags = moreTags.filter((t) => !existingLabels.has(t.label.toLowerCase()));
        const mergedTags = [...allTags, ...newTags];

        await Core.UserController.saveUserTags(userId, mergedTags);
      }
    } catch {
      // Ignore pagination errors
    }
  }, [enablePagination, userId, viewerId, allTags, hasMore]);

  const isLoading = localTags === undefined || (enableStats && isLoadingStats);

  const tagsWithAvatars = useMemo(() => transformTagsForViewer(allTags, viewerId), [allTags, viewerId]);

  return {
    tags: tagsWithAvatars,
    count: enableStats ? stats.uniqueTags : 0,
    isLoading,
    isLoadingMore: false,
    hasMore: enablePagination ? hasMore : false,
    loadMore,
    handleTagAdd,
    handleTagToggle,
  };
}
