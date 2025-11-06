'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';
import * as Shared from '@/shared/postActionVariants';

export type { PostActionVariant } from '@/shared/postActionVariants';

interface UsePostActionOptions {
  variant: Shared.PostActionVariant;
  postId?: string; // Required for 'reply' and 'repost', optional for 'new'
  onSuccess?: () => void;
}

/**
 * Unified hook to handle post actions (reply, repost, or new post)
 *
 * @param options - Configuration object containing variant, optional postId, and optional onSuccess callback
 * @returns Object containing content state, setContent function, and handleSubmit function
 *
 * @example
 * ```tsx
 * import { POST_ACTION_VARIANT } from '@/shared/postActionVariants';
 *
 * // For a reply
 * const { content, setContent, handleSubmit } = usePostAction({
 *   variant: POST_ACTION_VARIANT.REPLY,
 *   postId: 'post-123',
 *   onSuccess: () => console.log('Reply submitted!'),
 * });
 *
 * // For a repost
 * const { content, setContent, handleSubmit } = usePostAction({
 *   variant: POST_ACTION_VARIANT.REPOST,
 *   postId: 'post-123',
 * });
 *
 * // For a new post
 * const { content, setContent, handleSubmit } = usePostAction({
 *   variant: POST_ACTION_VARIANT.NEW,
 * });
 * ```
 */
export function usePostAction({ variant, postId, onSuccess }: UsePostActionOptions) {
  const [content, setContent] = useState('');
  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleSubmit = useCallback(async () => {
    // Validation: reply and new posts require content
    if (Shared.requiresContent(variant) && !content.trim()) {
      return;
    }

    // Validation: reply and repost require postId
    if (Shared.requiresPostId(variant) && !postId) {
      console.error(`postId is required for ${variant} variant`);
      return;
    }

    if (!currentUserId) {
      return;
    }

    try {
      const params: Core.TCreatePostParams = {
        content: content.trim(),
        authorId: currentUserId,
      };

      // Set the appropriate post ID based on variant
      if (variant === Shared.POST_ACTION_VARIANT.REPLY) {
        params.parentPostId = postId;
      } else if (variant === Shared.POST_ACTION_VARIANT.REPOST) {
        params.originalPostId = postId;
      }
      // For 'new', no additional params needed

      await Core.PostController.create(params);
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to submit ${variant}:`, error);
    }
  }, [content, variant, postId, currentUserId, onSuccess]);

  return {
    content,
    setContent,
    handleSubmit,
  };
}
