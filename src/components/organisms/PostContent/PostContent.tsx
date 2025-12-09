'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export interface PostContentOrganismProps {
  postId: string;
  /** Rendering inside a repost preview (prevents further nesting) */
  isRepostPreview?: boolean;
}

export function PostContent({ postId, isRepostPreview = false }: PostContentOrganismProps) {
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

  const hasRepostComment = postDetails.content.trim().length > 0;

  return (
    <Atoms.Container className="gap-3" overrideDefaults>
      {/* Repost comment (if any) */}
      {hasRepostComment && <Molecules.PostText content={postDetails.content} />}

      {/* Link previews from repost comment */}
      {hasRepostComment && <Molecules.PostLinkEmbeds content={postDetails.content} />}

      {/* Original post being reposted */}
      {canRenderRepostPreview && (
        <Atoms.Container className={Libs.cn('rounded-md bg-muted p-0', hasRepostComment && 'mt-4')} overrideDefaults>
          <Molecules.PostPreviewCard postId={originalPostId} isRepostPreview={true} />
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
