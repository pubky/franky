'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

export interface DialogReplyPostProps {
  postId: string;
}

export function DialogReplyPost({ postId }: DialogReplyPostProps) {
  return (
    <Atoms.Container className="flex flex-col gap-4 rounded-md bg-card p-6" overrideDefaults>
      <Organisms.PostHeader postId={postId} />
      <Organisms.PostContent postId={postId} />
    </Atoms.Container>
  );
}
