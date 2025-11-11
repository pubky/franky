'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';

interface UsePostRepostOptions {
  postId: string;
  onSuccess?: () => void;
}

/**
 * Custom hook to handle post repost submission
 *
 * @param options - Configuration object containing postId and optional onSuccess callback
 * @returns Object containing repostContent state, setRepostContent function, and handleRepostSubmit function
 *
 * @example
 * ```tsx
 * const { repostContent, setRepostContent, handleRepostSubmit } = usePostRepost({
 *   postId: 'post-123',
 *   onSuccess: () => console.log('Repost submitted!'),
 * });
 * ```
 */
export function usePostRepost({ postId, onSuccess }: UsePostRepostOptions) {
  const [repostContent, setRepostContent] = useState('');
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleRepostSubmit = useCallback(async () => {
    if (!postId || !currentUserId) return;

    try {
      await Core.PostController.create({
        originalPostId: postId,
        content: repostContent.trim(),
        authorId: currentUserId,
      });
      setRepostContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit repost:', error);
    }
  }, [repostContent, postId, currentUserId, onSuccess]);

  return {
    repostContent,
    setRepostContent,
    handleRepostSubmit,
  };
}
