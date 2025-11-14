'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

/**
 * TimelinePostReplies
 *
 * Renders replies for a specific post in the timeline with thread connectors (flat structure, 1 level).
 */
interface TimelinePostRepliesProps {
  postId: string;
  onPostClick: (postId: string) => void;
}

export function TimelinePostReplies({ postId, onPostClick }: TimelinePostRepliesProps) {
  // Get post details to retrieve the URI
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId), [postId]);

  // Fetch reply IDs for this post
  const replyIds = useLiveQuery(
    async () => {
      if (!postDetails?.uri) return [];

      const replyRelationships = await Core.db.post_relationships.where('replied').equals(postDetails.uri).toArray();

      return replyRelationships.map((rel) => rel.id);
    },
    [postDetails?.uri],
    [],
  );

  const hasReplies = replyIds && replyIds.length > 0;

  // Don't render anything if there are no replies
  if (!hasReplies) {
    return null;
  }

  return (
    <Atoms.Container overrideDefaults className="ml-3">
      {replyIds.map((replyId, index) => (
        <React.Fragment key={`reply_${replyId}`}>
          <Atoms.PostThreadSpacer />
          <Organisms.PostMain
            postId={replyId}
            isReply={true}
            onClick={() => onPostClick(replyId)}
            isLastReply={index === replyIds.length - 1}
          />
        </React.Fragment>
      ))}
    </Atoms.Container>
  );
}
