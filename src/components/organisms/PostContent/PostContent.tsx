'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export interface PostContentOrganismProps {
  postId: string;
  /** Rendering inside a repost preview (prevents further nesting) */
  isRepostPreview?: boolean;
  className?: string;
}

export function PostContent({ postId, isRepostPreview = false, className }: PostContentOrganismProps) {
  // Fetch post details for content
  const { postDetails } = Hooks.usePostDetails(postId);

  // Get repost information
  const { isRepost, originalPostId } = Hooks.useRepostInfo(postId);

  // Check if we should render the original post preview
  const canRenderRepostPreview = isRepost && originalPostId && !isRepostPreview;

  if (!postDetails) {
    // TODO: Add skeleton loading component for PostContent
    return <div className="text-muted-foreground">Loading content...</div>;
  }

  const hasContent = postDetails.content.trim().length > 0;

  return (
    <Atoms.Container className={Libs.cn('gap-3', className)}>
      {/* Post text (or repost comment) */}
      {hasContent && <Molecules.PostText content={postDetails.content} />}

      {/* Link previews from text */}
      {hasContent && <Molecules.PostLinkEmbeds content={postDetails.content} />}

      {/* Attachments on this post */}
      <Organisms.PostAttachments attachments={postDetails.attachments ?? null} />

      {/* Original post being reposted */}
      {canRenderRepostPreview && (
        <Atoms.Container className={Libs.cn('rounded-md bg-muted p-0', hasContent && 'mt-4')}>
          <Molecules.PostPreviewCard postId={originalPostId} isRepostPreview={true} />
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
