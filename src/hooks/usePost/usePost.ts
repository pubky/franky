'use client';

import { useState, useCallback, useEffect } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

interface UsePostReplyOptions {
  postId: string;
  tags?: string[];
  onSuccess?: () => void;
}

interface UsePostPostOptions {
  tags?: string[];
  onSuccess?: () => void;
}

/**
 * Custom hook to handle post creation (both replies and root posts)
 *
 * @returns Object containing content state, setContent function, reply method, post method, isSubmitting state, and error state
 *
 * @example
 * ```tsx
 * const { content, setContent, reply, post, isSubmitting, error } = usePost();
 *
 * // For replies:
 * const handleSubmit = reply({ postId: 'post-123', tags: ['tag1'], onSuccess: () => {} });
 *
 * // For root posts:
 * const handleSubmit = post({ tags: ['tag1'], onSuccess: () => {} });
 * ```
 */
export function usePost() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const { toast } = Molecules.useToast();

  // Handle error display and clear after showing toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
      // Clear error after showing toast to prevent duplicate toasts
      setError(null);
    }
  }, [error, toast]);

  const reply = useCallback(
    ({ postId, tags = [], onSuccess }: UsePostReplyOptions) => {
      const handleReplySubmit = async () => {
        if (!content.trim() || !postId || !currentUserId) return;

        setIsSubmitting(true);
        setError(null);

        try {
          await Core.PostController.create({
            parentPostId: postId,
            content: content.trim(),
            authorId: currentUserId,
            tags: tags.length > 0 ? tags : undefined,
          });
          setContent('');
          onSuccess?.();
        } catch (err) {
          console.error('Failed to submit reply:', err);
          setError('Failed to post reply. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };

      return handleReplySubmit;
    },
    [content, currentUserId],
  );

  const post = useCallback(
    ({ tags = [], onSuccess }: UsePostPostOptions) => {
      const handlePostSubmit = async () => {
        if (!content.trim() || !currentUserId) return;

        setIsSubmitting(true);
        setError(null);

        try {
          await Core.PostController.create({
            content: content.trim(),
            authorId: currentUserId,
            tags: tags.length > 0 ? tags : undefined,
          });
          setContent('');
          onSuccess?.();
        } catch (err) {
          console.error('Failed to create post:', err);
          setError('Failed to create post. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };

      return handlePostSubmit;
    },
    [content, currentUserId],
  );

  return {
    content,
    setContent,
    reply,
    post,
    isSubmitting,
    error,
  };
}
