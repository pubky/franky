'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export interface PostContentOrganismProps {
  postId: string;
  className?: string;
  /** Rendering inside a repost preview (prevents further nesting) */
  isRepostPreview?: boolean;
}

export function PostContent({ postId, className, isRepostPreview = false }: PostContentOrganismProps) {
  // Fetch post details for content
  const { postDetails } = Hooks.usePostDetails(postId);

  // Get repost information
  const { isRepost, originalPostId } = Hooks.useRepostInfo(postId);

  // Fetch original post details if this is a repost and not already inside a repost preview
  const canRenderRepostPreview = isRepost && originalPostId && !isRepostPreview;
  // Trigger fetch for original post (hook handles fetching automatically)
  Hooks.usePostDetails(originalPostId ?? null);

  if (!postDetails) {
    // TODO: Add skeleton loading component for PostContent
    return <div className="text-muted-foreground">Loading content...</div>;
  }

  const hasRepostComment = postDetails.content.trim().length > 0;

  return (
    <Atoms.Container className={Libs.cn('gap-3', className)}>
      {/* Repost comment (if any) */}
      {hasRepostComment && <Molecules.PostText content={postDetails.content} />}

      {/* Link previews from repost comment */}
      {hasRepostComment && <Molecules.PostLinkEmbeds content={postDetails.content} />}

      {/* Original post being reposted */}
      {canRenderRepostPreview && (
        <Atoms.Container className="rounded-md border border-transparent bg-muted p-0" overrideDefaults>
          <Atoms.Card className="rounded-md bg-muted py-0 shadow-none">
            <Molecules.PostPreviewCard postId={originalPostId} isRepostPreview={true} />
          </Atoms.Card>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
