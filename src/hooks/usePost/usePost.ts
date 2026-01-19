'use client';

import { useState, useCallback, useEffect } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { PubkyAppPostKind } from 'pubky-app-specs';

interface UsePostReplyOptions {
  postId: string;
  onSuccess?: (createdPostId: string) => void;
}

interface UsePostPostOptions {
  onSuccess?: (createdPostId: string) => void;
}

interface UsePostRepostOptions {
  originalPostId: string;
  onSuccess?: (createdPostId: string) => void;
}

/**
 * Custom hook to handle post creation (replies, reposts, and root posts)
 *
 * @returns Object containing content state, setContent function, tags state, setTags function, attachments state, setAttachments function, isArticle state, setIsArticle function, articleTitle state, setArticleTitle function, reply method, post method, repost method, isSubmitting state, and error state
 *
 * @example
 * ```tsx
 * const { content, setContent, tags, setTags, attachments, setAttachments, reply, post, repost, isSubmitting, error } = usePost();
 *
 * // For replies:
 * const handleSubmit = reply({ postId: 'post-123', onSuccess: () => {} });
 *
 * // For reposts:
 * const handleSubmit = repost({ originalPostId: 'post-123', onSuccess: () => {} });
 *
 * // For root posts:
 * const handleSubmit = post({ onSuccess: () => {} });
 * ```
 */
export function usePost() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isArticle, setIsArticle] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
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

  const showSuccessToast = useCallback(
    (title: string, description: string) => {
      toast({
        title,
        description,
      });
    },
    [toast],
  );

  const reply = useCallback(
    async ({ postId, onSuccess }: UsePostReplyOptions) => {
      // allow empty content and attachments
      if ((!content.trim() && attachments.length === 0) || !postId || !currentUserId) return;

      setIsSubmitting(true);

      try {
        const createdPostId = await Core.PostController.commitCreate({
          parentPostId: postId,
          content: content.trim(),
          authorId: currentUserId,
          tags: tags.length > 0 ? tags : undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        setContent('');
        setTags([]);
        setAttachments([]);
        showSuccessToast('Reply posted', 'Your reply has been posted successfully.');
        onSuccess?.(createdPostId);
      } catch (err) {
        Libs.Logger.error('[usePost] Failed to submit reply:', err);
        showErrorToast('Failed to post reply. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, tags, attachments, currentUserId, showErrorToast, showSuccessToast],
  );

  const post = useCallback(
    async ({ onSuccess }: UsePostPostOptions) => {
      // allow empty content and attachments if not article
      if (
        (!content.trim() && attachments.length === 0) ||
        (isArticle && (!content.trim() || !articleTitle.trim())) ||
        !currentUserId
      )
        return;

      setIsSubmitting(true);

      try {
        const createdPostId = await Core.PostController.commitCreate({
          content: isArticle ? JSON.stringify({ title: articleTitle.trim(), body: content.trim() }) : content.trim(),
          authorId: currentUserId,
          tags: tags.length > 0 ? tags : undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
          kind: isArticle ? PubkyAppPostKind.Long : PubkyAppPostKind.Short,
        });
        setContent('');
        setTags([]);
        setAttachments([]);
        setIsArticle(false);
        setArticleTitle('');
        showSuccessToast('Post created', 'Your post has been created successfully.');
        onSuccess?.(createdPostId);
      } catch (err) {
        Libs.Logger.error('[usePost] Failed to create post:', err);
        showErrorToast('Failed to create post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, tags, attachments, isArticle, articleTitle, currentUserId, showErrorToast, showSuccessToast],
  );

  const repost = useCallback(
    async ({ originalPostId, onSuccess }: UsePostRepostOptions) => {
      if (!originalPostId || !currentUserId) return;

      setIsSubmitting(true);

      try {
        const createdPostId = await Core.PostController.commitCreate({
          originalPostId,
          content: content.trim(),
          authorId: currentUserId,
          tags: tags.length > 0 ? tags : undefined,
        });
        setContent('');
        setTags([]);
        showSuccessToast('Repost successful', 'Your repost has been created successfully.');
        onSuccess?.(createdPostId);
      } catch (err) {
        Libs.Logger.error('[usePost] Failed to repost:', err);
        showErrorToast('Failed to repost. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, tags, currentUserId, showErrorToast, showSuccessToast],
  );

  // Clear attachments when switching to article mode
  useEffect(() => {
    if (isArticle) {
      setAttachments([]);
    }
  }, [isArticle]);

  return {
    content,
    setContent,
    tags,
    setTags,
    attachments,
    setAttachments,
    isArticle,
    setIsArticle,
    articleTitle,
    setArticleTitle,
    reply,
    post,
    repost,
    isSubmitting,
  };
}
