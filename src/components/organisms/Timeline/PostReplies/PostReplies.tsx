'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

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
  // Watch for changes in post_counts to trigger refetch when replies count changes
  const postCounts = useLiveQuery(() => Core.PostController.getPostCounts({ postId }), [postId]);

  // Fetch the first 3 reply IDs using the controller
  // This will re-run whenever postCounts.replies changes
  const replyIds = useLiveQuery(
    async () => {
      // Only fetch if there are replies
      if (!postCounts?.replies || postCounts.replies === 0) {
        return [];
      }

      try {
        // Use controller to get first 3 replies
        return await Core.PostController.getFirstReplies({ postId, limit: 3 });
      } catch (error) {
        // Silently handle errors - don't show replies if there's an issue
        Libs.Logger.error('Failed to fetch post replies:', error);
        return [];
      }
    },
    [postId, postCounts?.replies], // Re-fetch when postId or reply count changes
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
