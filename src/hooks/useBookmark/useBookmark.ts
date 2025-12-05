'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface UseBookmarkResult {
  isBookmarked: boolean;
  isLoading: boolean;
  isToggling: boolean;
  toggle: () => Promise<void>;
}

/**
 * Custom hook to manage bookmark state for a post
 *
 * @param postId - The composite post ID (authorId:postId)
 * @returns Object with isBookmarked state and toggle function
 *
 * @example
 * ```tsx
 * function PostActions({ postId }) {
 *   const { isBookmarked, toggle } = useBookmark(postId);
 *
 *   return (
 *     <button onClick={toggle}>
 *       {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useBookmark(postId: string): UseBookmarkResult {
  const { toast } = Molecules.useToast();
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Check if post is bookmarked on mount and when postId changes
  useEffect(() => {
    if (!postId) {
      setIsBookmarked(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Core.BookmarkController.exists(postId)
      .then((exists) => {
        setIsBookmarked(exists);
        setIsLoading(false);
      })
      .catch((error) => {
        Libs.Logger.error('[useBookmark] Failed to check bookmark status', { error, postId });
        setIsBookmarked(false);
        setIsLoading(false);
      });
  }, [postId]);

  const toggle = useCallback(async (): Promise<void> => {
    if (!currentUserPubky) {
      toast({
        title: 'Error',
        description: 'You must be logged in to bookmark posts',
      });
      return;
    }

    if (isToggling) return; // Prevent double-clicks

    setIsToggling(true);
    try {
      if (isBookmarked) {
        await Core.BookmarkController.delete({ postId, userId: currentUserPubky });
        setIsBookmarked(false);
        toast({
          title: 'Bookmark removed',
          description: 'Post removed from your bookmarks',
        });
      } else {
        await Core.BookmarkController.create({ postId, userId: currentUserPubky });
        setIsBookmarked(true);
        toast({
          title: 'Bookmark added',
          description: 'Post saved to your bookmarks',
        });
      }
    } catch (error) {
      Libs.Logger.error('[useBookmark] Failed to toggle bookmark', { error, postId, currentUserPubky });
      toast({
        title: 'Error',
        description: isBookmarked ? 'Failed to remove bookmark' : 'Failed to add bookmark',
      });
    } finally {
      setIsToggling(false);
    }
  }, [postId, currentUserPubky, isBookmarked, isToggling, toast]);

  return {
    isBookmarked,
    isLoading,
    isToggling,
    toggle,
  };
}
