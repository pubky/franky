'use client';

import * as Organisms from '@/organisms';
import * as Core from '@/core';

/**
 * ProfilePageReplies
 *
 * Displays replies from the current user's profile with infinite scroll pagination.
 * Uses the author_replies stream (author_replies:{userId}) to fetch replies.
 */
export function ProfilePageReplies() {
  // Get current authenticated user
  const { currentUserPubky } = Core.useAuthStore();

  // Build stream ID for user's replies: author_replies:{userId}
  const streamId = currentUserPubky
    ? (`${Core.StreamSource.AUTHOR_REPLIES}:${currentUserPubky}` as Core.AuthorRepliesStreamCompositeId)
    : undefined;

  // Delegate to TimelinePosts with the specific streamId
  return <Organisms.TimelinePosts streamId={streamId} />;
}
