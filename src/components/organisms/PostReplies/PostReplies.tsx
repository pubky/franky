'use client';

import { useEffect, useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Templates from '@/templates';

interface PostRepliesProps {
  postId: string;
}

export function PostReplies({ postId }: PostRepliesProps) {
  const [replyIds, setReplyIds] = useState<string[]>([]);

  useEffect(() => {
    Core.PostController.getReplyIds(postId).then(setReplyIds);
  }, [postId]);

  return (
    <Atoms.Container className="flex flex-col gap-4">
      {replyIds?.map((replyId, index) => (
        <div key={replyId} className="flex gap-4">
          <div className="w-8 flex-shrink-0">{/* Reply connector SVG will go here */}</div>
          <div className="flex-1">
            <Templates.PostWide postId={replyId} showReplyConnector={true} isLast={index === replyIds.length - 1} />
          </div>
        </div>
      ))}
    </Atoms.Container>
  );
}
