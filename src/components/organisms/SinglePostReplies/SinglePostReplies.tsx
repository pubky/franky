'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

interface PostRepliesProps {
  postId: string;
}

export function SinglePostReplies({ postId }: PostRepliesProps): React.ReactElement {
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId), [postId]);

  const router = useRouter();

  // useLiveQuery is required here instead of useEffect because when
  // someone post a reply through PostReplyInput we need this to rerender
  const replyIds = useLiveQuery(
    async () => {
      if (!postDetails?.uri) return [];

      const replyRelationships = await Core.db.post_relationships.where('replied').equals(postDetails.uri).toArray();

      return replyRelationships.map((rel) => rel.id);
    },
    [postDetails?.uri],
    [],
  );

  const handleReplyClick = useCallback(
    (combinedId: string) => {
      try {
        const { pubky: authorId, id: replyPostId } = Core.parseCompositeId(combinedId);
        router.push(`/post/${authorId}/${replyPostId}`);
      } catch {
        return; // defensive guard
      }
    },
    [router],
  );

  return (
    <Atoms.Container className="flex flex-col gap-4">
      {replyIds?.map((replyId) => (
        <div key={replyId} className="flex gap-4">
          <div className="w-8 flex-shrink-0">{/* Reply connector SVG will go here */}</div>
          <div className="flex-1">
            <Organisms.SinglePost
              postId={replyId}
              isReply={true}
              clickable={true}
              onClick={() => handleReplyClick(replyId)}
            />
          </div>
        </div>
      ))}
    </Atoms.Container>
  );
}
