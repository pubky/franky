'use client';

import { useParams } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';

interface PostWideProps {
  clickable?: boolean;
  isReply?: boolean;
  onClick?: () => void;
}

export function SinglePost({ clickable = false, isReply = false, onClick }: PostWideProps) {
  const { postId, userId } = useParams() as { postId: string; userId: string };
  const pId = Core.buildPostCompositeId({ pubky: userId, postId });

  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Organisms.SinglePost postId={pId} clickable={clickable} isReply={isReply} onClick={onClick} />
      </Atoms.Container>
      <Atoms.Container size="container" className="px-6 pb-8 mt-4">
        <Atoms.Container className="flex flex-col gap-4">
          <Organisms.SinglePostReplies postId={pId} />
          <Organisms.SinglePostReplyInput postId={pId} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
