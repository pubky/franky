'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import { toast } from '@/molecules/Toaster/use-toast';
import type { UsePostTagsResult, UsePostTagsOptions } from './usePostTags.types';
import { transformTagsForViewer } from '@/molecules/TaggedItem/TaggedItem.utils';
import { TAGS_PER_PAGE } from './usePostTags.constants';

/**
 * Hook for fetching and managing post tags with pagination.
 * Uses useLiveQuery with PostController for automatic reactivity.
 *
 * The TagController.commitCreate/commitDelete methods follow local-first pattern:
 * they update IndexedDB first, then sync to server.
 * This means useLiveQuery will react immediately to changes.
 */
export function usePostTags(postId: string | null | undefined, options: UsePostTagsOptions = {}): UsePostTagsResult {
  const { viewerId: customViewerId } = options;

  // selectCurrentUserPubky() throws an error when user is not authenticated;
  // access currentUserPubky directly to get null instead (unauthenticated views should still render tags)
  const currentUserId = Core.useAuthStore((state) => state.currentUserPubky);
  const viewerId = customViewerId ?? currentUserId;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedCountRef = useRef(0);
  const prevPostIdRef = useRef<string | null | undefined>(null);

  // Reset state when postId changes
  useEffect(() => {
    if (prevPostIdRef.current !== postId) {
      setHasMore(true);
      loadedCountRef.current = 0;
      prevPostIdRef.current = postId;
    }
  }, [postId]);

  // Fetch tags via PostController - returns TagCollectionModelSchema[] where each has { id, tags: NexusTag[] }
  const tagsCollection = useLiveQuery(
    async () => {
      if (!postId) return null;
      return await Core.PostController.getTags({ compositeId: postId });
    },
    [postId],
    undefined,
  );

  const isLoading = tagsCollection === undefined;

  // Extract NexusTag[] from the collection (first item contains the tags array)
  const tags = useMemo(() => {
    if (!tagsCollection || tagsCollection.length === 0) return [];
    return tagsCollection[0]?.tags ?? [];
  }, [tagsCollection]);

  // Update loaded count when tags change
  useEffect(() => {
    if (tags.length > loadedCountRef.current) {
      loadedCountRef.current = tags.length;
    }
  }, [tags.length]);

  // Transform tags with avatar data and relationship status
  const tagsWithAvatars = useMemo(() => transformTagsForViewer(tags, viewerId), [tags, viewerId]);

  // Load more tags from Nexus
  const loadMore = useCallback(async () => {
    if (!postId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const skip = loadedCountRef.current;
      const newTags = await Core.PostController.fetchTags({
        compositeId: postId,
        skip,
        limit: TAGS_PER_PAGE,
      });

      if (newTags.length < TAGS_PER_PAGE) {
        setHasMore(false);
      }

      // loadedCountRef will be updated by the effect when tags change
    } catch {
      toast({
        title: 'Failed to load more tags',
        description: 'Could not load more tags. Please try again.',
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [postId, isLoadingMore, hasMore]);

  const handleTagAdd = useCallback(
    async (tagString: string): Promise<{ success: boolean; error?: string }> => {
      const label = tagString.trim();

      if (!label) return { success: false, error: 'Tag label cannot be empty' };
      if (!postId) return { success: false, error: 'Post ID is required' };
      if (!viewerId) return { success: false, error: 'You must be logged in to add tags' };

      // Check if user already tagged
      const existingTag = tags.find((t) => t.label.toLowerCase() === label.toLowerCase());
      if (existingTag?.taggers?.includes(viewerId)) {
        return { success: false, error: 'You have already added this tag' };
      }

      try {
        await Core.TagController.commitCreate({
          taggedId: postId,
          label,
          taggerId: viewerId,
          taggedKind: Core.TagKind.POST,
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
    [postId, viewerId, tags],
  );

  const handleTagToggle = useCallback(
    async (tag: { label: string; relationship?: boolean }): Promise<void> => {
      if (!postId || !viewerId) return;

      // Use the relationship from the tag (which comes from transformTagsForViewer)
      // This is more reliable than checking the taggers array which may be truncated
      const currentTag = tags.find((t) => t.label === tag.label);
      const userIsTagger =
        tag.relationship ?? currentTag?.relationship ?? currentTag?.taggers?.includes(viewerId) ?? false;

      try {
        if (userIsTagger) {
          await Core.TagController.commitDelete({
            taggedId: postId,
            label: tag.label,
            taggerId: viewerId,
            taggedKind: Core.TagKind.POST,
          });
        } else {
          await Core.TagController.commitCreate({
            taggedId: postId,
            label: tag.label,
            taggerId: viewerId,
            taggedKind: Core.TagKind.POST,
          });
        }
      } catch {
        toast({
          title: userIsTagger ? 'Failed to remove tag' : 'Failed to add tag',
          description: `Could not ${userIsTagger ? 'remove' : 'add'} "${tag.label}". Please try again.`,
        });
      }
    },
    [postId, viewerId, tags],
  );

  return {
    tags: tagsWithAvatars,
    count: tags.length,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    handleTagAdd,
    handleTagToggle,
  };
}
