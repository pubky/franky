'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

interface UsePostReplyOptions {
  postId: string;
  onSuccess?: (createdPostId: string) => void;
}

interface UsePostPostOptions {
  onSuccess?: (createdPostId: string) => void;
}

/**
 * Custom hook to handle post creation (both replies and root posts)
 *
 * @returns Object containing content state, setContent function, tags state, setTags function, reply method, post method, isSubmitting state, and error state
 *
 * @example
 * ```tsx
 * const { content, setContent, tags, setTags, reply, post, isSubmitting, error } = usePost();
 *
 * // For replies:
 * const handleSubmit = reply({ postId: 'post-123', onSuccess: () => {} });
 *
 * // For root posts:
 * const handleSubmit = post({ onSuccess: () => {} });
 * ```
 */
export function usePost() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());
  const { toast } = Molecules.useToast();

  const showErrorToast = useCallback(
    (description: string) => {
      toast({
        title: 'Error',
        description,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    },
    [toast],
  );

  const reply = useCallback(
    async ({ postId, onSuccess }: UsePostReplyOptions) => {
      if (!content.trim() || !postId || !currentUserId) return;

      setIsSubmitting(true);

      try {
        const createdPostId = await Core.PostController.create({
          parentPostId: postId,
          content: content.trim(),
          authorId: currentUserId,
          tags: tags.length > 0 ? tags : undefined,
        });
        setContent('');
        setTags([]);
        onSuccess?.(createdPostId);
      } catch (err) {
        console.error('Failed to submit reply:', err);
        showErrorToast('Failed to post reply. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, tags, currentUserId, showErrorToast],
  );

  const post = useCallback(
    async ({ onSuccess }: UsePostPostOptions) => {
      if (!content.trim() || !currentUserId) return;

      setIsSubmitting(true);

      try {
        const createdPostId = await Core.PostController.create({
          content: content.trim(),
          authorId: currentUserId,
          tags: tags.length > 0 ? tags : undefined,
        });
        setContent('');
        setTags([]);
        onSuccess?.(createdPostId);
      } catch (err) {
        console.error('Failed to create post:', err);
        showErrorToast('Failed to create post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, tags, currentUserId, showErrorToast],
  );

  return {
    content,
    setContent,
    tags,
    setTags,
    reply,
    post,
    isSubmitting,
  };
}
