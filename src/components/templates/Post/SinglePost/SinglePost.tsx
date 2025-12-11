'use client';

import { useParams } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';

export function SinglePost(): React.ReactElement {
  const { postId, userId } = useParams() as { postId: string; userId: string };
  const pId = Core.buildCompositeId({ pubky: userId, id: postId });

  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="gap-4 px-6">
        <Organisms.SinglePost postId={pId} />
      </Atoms.Container>
      <Atoms.Container size="container" className="mt-4 px-6 pb-8">
        <Atoms.Container className="flex flex-col gap-4">
          <Organisms.SinglePostReplies postId={pId} />
          <Organisms.SinglePostReplyInput postId={pId} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
