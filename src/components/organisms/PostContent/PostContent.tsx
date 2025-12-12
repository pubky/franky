'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import type { PostContentOrganismProps } from './PostContent.types';

/**
 * PostContent - Wrapper component that handles repost preview rendering.
 * Uses PostContentBase for the actual content rendering and adds repost preview logic.
 * When a post is a repost, it renders the original post in a PostPreviewCard.
 */
export function PostContent({ postId, className }: PostContentOrganismProps) {
  // Get repost information (uses isRepost and originalPostId for preview rendering)
  const { isRepost, originalPostId } = Hooks.useRepostInfo(postId);

  // Get post details to check if there's content (for spacing)
  const { postDetails } = Hooks.usePostDetails(postId);
  const hasContent = (postDetails?.content?.trim().length ?? 0) > 0;

  // Check if we should render the original post preview
  const canRenderRepostPreview = isRepost && originalPostId;

  return (
    <>
      <Organisms.PostContentBase postId={postId} className={className} />

      {/* Original post being reposted */}
      {canRenderRepostPreview && (
        <Molecules.PostPreviewCard postId={originalPostId} className={Libs.cn('bg-muted', hasContent && 'mt-4')} />
      )}
    </>
  );
}
