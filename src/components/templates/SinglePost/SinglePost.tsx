'use client';

import { useParams } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface PostWideProps {
  clickable?: boolean;
  isReply?: boolean;
  onClick?: () => void;
}

export function SinglePost({ clickable = false, isReply = false, onClick }: PostWideProps) {
  const { postId, userId } = useParams() as { postId: string; userId: string };
  const pId = `${userId}:${postId}`;

  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Organisms.Post postId={pId} clickable={clickable} isReply={isReply} onClick={onClick} />
      </Atoms.Container>
      <Atoms.Container size="container" className="px-6 pb-8 mt-4">
        <Atoms.Container className="flex flex-col gap-4">
          <Organisms.PostReplies postId={pId} />
          <Organisms.PostReplyInput postId={pId} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
