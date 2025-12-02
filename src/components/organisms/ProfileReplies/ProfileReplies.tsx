'use client';

import * as Core from '@/core';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';

/**
 * ProfileReplies
 *
 * Displays replies from a user's profile with infinite scroll pagination.
 * Uses the author_replies stream (author_replies:{userId}) to fetch replies.
 * Uses ProfileContext to get the target user's pubky.
 */
export function ProfileReplies() {
  // Get the profile pubky from context
  const { pubky } = Providers.useProfileContext();

  // Build stream ID for user's replies: author_replies:{userId}
  const streamId = pubky
    ? (`${Core.StreamSource.AUTHOR_REPLIES}:${pubky}` as Core.AuthorRepliesStreamCompositeId)
    : undefined;

  // If no streamId, render empty state
  if (!streamId) {
    return null;
  }

  // Use TimelineRepliesWithParent to show parent post + reply with line
  return <Organisms.TimelineRepliesWithParent streamId={streamId} />;
}
