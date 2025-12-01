'use client';

import * as Core from '@/core';
import * as Organisms from '@/organisms';

/**
 * ProfileReplies
 *
 * Displays replies from the current user's profile with infinite scroll pagination.
 * Uses the author_replies stream (author_replies:{userId}) to fetch replies.
 */
export function ProfileReplies() {
  // Get current authenticated user
  const { currentUserPubky } = Core.useAuthStore();

  // Build stream ID for user's replies: author_replies:{userId}
  const streamId = currentUserPubky
    ? (`${Core.StreamSource.AUTHOR_REPLIES}:${currentUserPubky}` as Core.AuthorRepliesStreamCompositeId)
    : undefined;

  // If no streamId, render empty state
  if (!streamId) {
    return null;
  }

  // Use TimelineRepliesWithParent to show parent post + reply with line
  return <Organisms.TimelineRepliesWithParent streamId={streamId} />;
}
