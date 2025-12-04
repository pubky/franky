'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';

interface UsePostReplyOptions {
  postId: string;
  tags?: string[];
  onSuccess?: () => void;
}

/**
 * Custom hook to handle post reply submission
 *
 * @param options - Configuration object containing postId, optional tags array, and optional onSuccess callback
 * @returns Object containing replyContent state, setReplyContent function, handleReplySubmit function, isSubmitting state, and error state
 *
 * @example
 * ```tsx
 * const { replyContent, setReplyContent, handleReplySubmit, isSubmitting, error } = usePostReply({
 *   postId: 'post-123',
 *   tags: ['tag1', 'tag2'],
 *   onSuccess: () => console.log('Reply submitted!'),
 * });
 * ```
 */
export function usePostReply({ postId, tags = [], onSuccess }: UsePostReplyOptions) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleReplySubmit = useCallback(async () => {
    if (!replyContent.trim() || !postId || !currentUserId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await Core.PostController.create({
        parentPostId: postId,
        content: replyContent.trim(),
        authorId: currentUserId,
        tags: tags.length > 0 ? tags : undefined,
      });
      setReplyContent('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [replyContent, postId, currentUserId, tags, onSuccess]);

  return {
    replyContent,
    setReplyContent,
    handleReplySubmit,
    isSubmitting,
    error,
  };
}
