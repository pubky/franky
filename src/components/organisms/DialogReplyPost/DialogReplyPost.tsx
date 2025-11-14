'use client';

import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as Atoms from '@/atoms';

interface DialogReplyPostProps {
  postId: string;
  className?: string;
}

export function DialogReplyPost({ postId, className }: DialogReplyPostProps) {
  return (
    <Atoms.Card className={Libs.cn('rounded-md py-0', className)}>
      <Atoms.CardContent className="flex flex-col gap-4 p-6">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContent postId={postId} />
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
