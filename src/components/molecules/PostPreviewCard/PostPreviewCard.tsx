'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import type { PostPreviewCardProps } from './PostPreviewCard.types';

export function PostPreviewCard({ postId, children }: PostPreviewCardProps) {
  return (
    <Atoms.CardContent className="flex flex-col gap-4 p-6">
      <Organisms.PostHeader postId={postId} />
      <Organisms.PostContent postId={postId} />
      {children}
    </Atoms.CardContent>
  );
}
