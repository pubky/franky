'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Types from './PostReplies.types';

/**
 * TimelinePostReplies
 *
 * Renders replies for a specific post in the timeline with thread connectors (flat structure, 1 level).
 * This component shows a preview of up to 3 replies inline with the parent post.
 * It does NOT use pagination - for full replies view, see TimelineRepliesWithParent.
 */

export function TimelinePostReplies({ postId, onPostClick }: Types.TimelinePostRepliesProps) {
  const [replyIds, setReplyIds] = useState<string[]>([]);

  // Watch for changes in post_counts to trigger refetch when replies count changes
  const postCounts = useLiveQuery(() => Core.PostController.getCounts({ compositeId: postId }), [postId]);

  // Check if parent post is deleted to determine replyability
  const { isParentDeleted } = Hooks.useParentPostDeleted(postId);

  const fetchReplies = useCallback(
    async (repliesCount: number) => {
      try {
        const response = await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId: `${Core.StreamSource.REPLIES}:${postId}`,
          streamTail: 0,
          lastPostId: undefined,
          limit: repliesCount > 3 ? 3 : repliesCount,
        });
        setReplyIds(response.nextPageIds);
      } catch (error) {
        // Silently handle errors - don't show replies if there's an issue
        Libs.Logger.error('Failed to fetch post replies:', error);
        setReplyIds([]);
      }
    },
    [postId],
  );

  useEffect(() => {
    if (!postCounts?.replies || postCounts.replies < 1) {
      setReplyIds([]);
      return;
    }

    fetchReplies(postCounts.replies);
  }, [postId, postCounts?.replies, fetchReplies]);

  const hasReplies = replyIds && replyIds.length > 0;

  // Don't render anything if there are no replies
  if (!hasReplies) {
    return null;
  }

  const shouldShowQuickReply = !isParentDeleted;

  return (
    <Atoms.Container overrideDefaults className="ml-3">
      {replyIds.map((replyId, index) => (
        <React.Fragment key={`reply_${replyId}`}>
          <Atoms.PostThreadSpacer />
          <Organisms.PostMain
            postId={replyId}
            isReply={true}
            onClick={() => onPostClick(replyId)}
            isLastReply={index === replyIds.length - 1 && !shouldShowQuickReply}
          />
        </React.Fragment>
      ))}

      {shouldShowQuickReply && (
        <>
          <Atoms.PostThreadSpacer />
          <Organisms.QuickReply parentPostId={postId} />
        </>
      )}
    </Atoms.Container>
  );
}
