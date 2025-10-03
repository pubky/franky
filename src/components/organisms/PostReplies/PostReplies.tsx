'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

interface PostRepliesProps {
  postId: string;
}

export function PostReplies({ postId }: PostRepliesProps) {
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId), [postId]);

  const replyIds = useLiveQuery(
    async () => {
      if (!postDetails?.uri) return [];

      const replyRelationships = await Core.db.post_relationships.where('replied').equals(postDetails.uri).toArray();

      return replyRelationships.map((rel) => rel.id);
    },
    [postDetails?.uri],
    [],
  );

  return (
    <Atoms.Container className="flex flex-col gap-4">
      {replyIds?.map((replyId) => (
        <div key={replyId} className="flex gap-4">
          <div className="w-8 flex-shrink-0">{/* Reply connector SVG will go here */}</div>
          <div className="flex-1">
            <Organisms.Post postId={replyId} isReply={true} />
          </div>
        </div>
      ))}
    </Atoms.Container>
  );
}
