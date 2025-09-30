'use client';

import { useEffect, useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Templates from '@/templates';
import * as Organisms from '@/organisms';

interface PostPageParams {
  params: Promise<{
    profileId: Core.Pubky;
    postId: string;
  }>;
}

export default function PostPage({ params }: PostPageParams) {
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ postId: resolvedPostId }) => {
      setPostId(resolvedPostId);
    });
  }, [params]);

  if (!postId) {
    return null;
  }

  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Templates.PostWide postId={postId} />
      </Atoms.Container>

      <Atoms.Container size="container" className="px-6 pb-8 mt-4">
        <Atoms.Container className="flex flex-col gap-4">
          <Organisms.PostReplies postId={postId} />
          <Organisms.PostReplyInput postId={postId} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
