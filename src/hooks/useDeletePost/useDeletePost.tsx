'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import type { UseDeletePostResult } from './useDeletePost.types';

/**
 * Hook to delete a post.
 * Handles post deletion with loading state and error handling.
 * Automatically removes the post from the timeline feed if inside a TimelineFeed context.
 *
 * @param postId - Composite post ID of the post to delete
 * @returns Delete function and loading state
 *
 * @example
 * ```tsx
 * const { deletePost, isDeleting } = useDeletePost(postId);
 *
 * <button onClick={deletePost} disabled={isDeleting}>
 *   {isDeleting ? 'Deleting...' : 'Delete'}
 * </button>
 * ```
 */
export function useDeletePost(postId: string): UseDeletePostResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = Molecules.useToast();
  const timelineFeed = Organisms.useTimelineFeedContext();

  const deletePost = useCallback(
    async (targetPostId?: string) => {
      const idToDelete = targetPostId ?? postId;
      if (isDeleting) return;
      if (!idToDelete) return;

      setIsDeleting(true);

      // Optimistically remove post from timeline feed
      timelineFeed?.removePosts(idToDelete);

      try {
        await Core.PostController.delete({ compositePostId: idToDelete });
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted',
        });
      } catch (error) {
        console.error('Failed to delete post:', error);

        // If deletion fails, restore the post to the timeline feed
        timelineFeed?.prependPosts(idToDelete);

        toast({
          title: 'Error',
          description: 'Failed to delete post. Please try again.',
          className: 'destructive border-destructive bg-destructive text-destructive-foreground',
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [postId, isDeleting, toast, timelineFeed],
  );

  return {
    isDeleting,
    deletePost,
  };
}
