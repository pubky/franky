'use client';

import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

interface DialogReplyPostProps {
  postId: string;
  className?: string;
}

export function DialogReplyPost({ postId, className }: DialogReplyPostProps) {
  return (
    <div className={Libs.cn('bg-card rounded-md p-6 flex flex-col gap-4 w-full', className)}>
      <Organisms.PostHeader postId={postId} />
      <Organisms.PostContent postId={postId} />
    </div>
  );
}
