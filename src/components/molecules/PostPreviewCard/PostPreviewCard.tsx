'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import type { PostPreviewCardProps } from './PostPreviewCard.types';

export function PostPreviewCard({ postId, className }: PostPreviewCardProps) {
  return (
    <Atoms.Card className={Libs.cn('rounded-md py-0', className)}>
      <Atoms.CardContent className="flex flex-col gap-4 p-6">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContentBase postId={postId} />
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
