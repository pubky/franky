'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';

interface UsePostCreateOptions {
  onSuccess?: () => void;
}

/**
 * Custom hook to handle new post creation
 *
 * @param options - Configuration object with optional onSuccess callback
 * @returns Object containing postContent state, setPostContent function, and handlePostSubmit function
 *
 * @example
 * ```tsx
 * const { postContent, setPostContent, handlePostSubmit } = usePostCreate({
 *   onSuccess: () => console.log('Post created!'),
 * });
 * ```
 */
export function usePostCreate({ onSuccess }: UsePostCreateOptions) {
  const [postContent, setPostContent] = useState('');
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handlePostSubmit = useCallback(async () => {
    if (!postContent.trim() || !currentUserId) return;

    try {
      await Core.PostController.create({
        content: postContent.trim(),
        authorId: currentUserId,
      });
      setPostContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit post:', error);
    }
  }, [postContent, currentUserId, onSuccess]);

  return {
    postContent,
    setPostContent,
    handlePostSubmit,
  };
}
