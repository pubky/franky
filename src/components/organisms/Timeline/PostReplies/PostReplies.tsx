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
  const postCounts = useLiveQuery(() => {
    // TODO: move to controller function
    return Core.db.post_counts.get(postId);
  }, [postId]);

  // Get post details to retrieve the URI
  const postDetails = useLiveQuery(() => {
    // TODO: move to controller function
    return Core.db.post_details.get(postId);
  }, [postId]);

  // Fetch the latest 3 reply IDs directly from IndexedDB
  // This will re-run whenever postCounts.replies changes
  const replyIds = useLiveQuery(
    async () => {
      // Only fetch if there are replies and we have the post URI
      if (!postCounts?.replies || postCounts.replies === 0 || !postDetails?.uri) {
        return [];
      }

      try {
        // TODO: move to controller function
        // Query post_relationships to find replies to this post
        const replyRelationships = await Core.db.post_relationships.where('replied').equals(postDetails.uri).toArray();

        // TODO: move to controller function
        // Get post_details for each reply to sort by timestamp
        const replyDetailsPromises = replyRelationships.map(async (rel) => {
          // TODO: move to controller function
          return Core.db.post_details
            .get(rel.id)
            .then((details) => ({ id: rel.id, indexed_at: details?.indexed_at || 0 }));
        });

        const repliesWithTimestamps = await Promise.all(replyDetailsPromises);

        // Sort by indexed_at descending (most recent first) and take first 3
        const latest3Replies = repliesWithTimestamps
          .sort((a, b) => b.indexed_at - a.indexed_at)
          .slice(0, 3)
          .map((reply) => reply.id);

        return latest3Replies;
      } catch (error) {
        // Silently handle errors - don't show replies if there's an issue
        Libs.Logger.error('Failed to fetch post replies:', error);
        return [];
      }
    },
    [postId, postCounts?.replies, postDetails?.uri], // Re-fetch when any of these change
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
