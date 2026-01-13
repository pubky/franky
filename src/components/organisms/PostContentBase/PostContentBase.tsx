'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import type { PostContentBaseProps } from './PostContentBase.types';

/**
 * PostContentBase - Base component that renders post content without repost handling.
 * This component is used internally by PostContent and PostPreviewCard.
 * It only renders the content elements: text, link embeds, and attachments.
 */
export function PostContentBase({ postId, className }: PostContentBaseProps) {
  // Fetch post details for content
  const { postDetails } = Hooks.usePostDetails(postId);

  if (!postDetails) {
    // TODO: Add skeleton loading component for PostContent
    return <div className="text-muted-foreground">Loading content...</div>;
  }

  const hasContent = postDetails.content.trim().length > 0;
  const isBlurred = postDetails.is_blurred;

  if (isBlurred) return <Organisms.PostContentBlurred postId={postId} className={className} />;

  return (
    <Atoms.Container className={Libs.cn('gap-3', className)}>
      {/* Post text */}
      {hasContent && <Molecules.PostText content={postDetails.content} />}

      {/* Link previews from text */}
      {hasContent && <Molecules.PostLinkEmbeds content={postDetails.content} />}

      {/* Attachments on this post */}
      <Organisms.PostAttachments attachments={postDetails.attachments ?? null} />
    </Atoms.Container>
  );
}
