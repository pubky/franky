'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import type { PostPreviewCardProps } from './PostPreviewCard.types';

export function PostPreviewCard({ postId, children, isRepostPreview = false }: PostPreviewCardProps) {
  const { isRepost, isCurrentUserRepost } = Hooks.useRepostInfo(postId);
  const { deletePost, isDeleting } = Hooks.useDeletePost(postId);

  const showRepostHeader = isRepost && isCurrentUserRepost && !isRepostPreview;

  return (
    <>
      {showRepostHeader && <Molecules.RepostHeader onUndo={() => deletePost()} isUndoing={isDeleting} />}
      <Atoms.CardContent className="flex flex-col gap-4 p-6">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContent postId={postId} isRepostPreview={isRepostPreview} />
        {children}
      </Atoms.CardContent>
    </>
  );
}
