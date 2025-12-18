'use client';

// Import directly to avoid circular dependency with @/hooks barrel
import { usePostDetails } from '@/hooks/usePostDetails';
import { useRepostInfo } from '@/hooks/useRepostInfo';
import type { UsePostHeaderVisibilityResult } from './usePostHeaderVisibility.types';

/**
 * Composite hook that determines PostHeader and RepostHeader visibility for a post.
 * This hook combines post details and repost information to compute visibility logic.
 *
 * **Visibility Rules:**
 * - **RepostHeader**: Shown when post is a repost by the current user
 * - **PostHeader**: Hidden only for simple reposts (no content) by current user
 *   - Shown for regular posts
 *   - Shown for quote reposts (with text content)
 *   - Shown for reposts with attachments (even without text)
 *   - Shown for reposts by other users
 *   - Shown during loading state (to avoid layout shift)
 *
 * @param postId - Composite post ID in format "authorId:postId"
 * @returns Object with showRepostHeader and shouldShowPostHeader flags
 *
 * @example
 * ```tsx
 * const { showRepostHeader, shouldShowPostHeader } = usePostHeaderVisibility(postId);
 *
 * return (
 *   <>
 *     {showRepostHeader && <RepostHeader onUndo={deletePost} />}
 *     {shouldShowPostHeader && <PostHeader postId={postId} />}
 *   </>
 * );
 * ```
 */
export function usePostHeaderVisibility(postId: string): UsePostHeaderVisibilityResult {
  const { postDetails } = usePostDetails(postId);
  const { isRepost, isCurrentUserRepost } = useRepostInfo(postId);

  // Show repost header when post is a repost by current user
  const showRepostHeader = isRepost && isCurrentUserRepost;

  // Determine if post has any content (text or attachments)
  // A repost with attachments but no text should still show the PostHeader
  // When postDetails is undefined/null (loading), default to showing header to avoid layout shift
  const hasTextContent = postDetails ? (postDetails.content?.trim().length ?? 0) > 0 : false;
  const hasAttachments = postDetails ? (postDetails.attachments?.length ?? 0) > 0 : false;
  const hasContent = hasTextContent || hasAttachments;

  // Hide PostHeader for simple reposts (no content) by current user
  // Show PostHeader if it's not a repost, or if it has content (quote repost or repost with attachments), or if it's not the current user's repost
  // When postDetails is undefined/null, show header to avoid layout shift during loading
  const isSimpleRepostByCurrentUser =
    isRepost && isCurrentUserRepost && postDetails !== undefined && postDetails !== null && !hasContent;
  const shouldShowPostHeader = !isSimpleRepostByCurrentUser;

  return {
    showRepostHeader,
    shouldShowPostHeader,
  };
}
