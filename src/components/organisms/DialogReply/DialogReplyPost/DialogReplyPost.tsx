'use client';

import * as Organisms from '@/organisms';
import * as Atoms from '@/atoms';
import type { DialogReplyPostProps } from './DialogReplyPost.types';

export function DialogReplyPost({ postId }: DialogReplyPostProps) {
  return (
    <Atoms.Card className="rounded-md py-0">
      <Atoms.CardContent className="flex flex-col gap-4 p-6">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContent postId={postId} />
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
