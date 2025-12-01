'use client';

import * as Core from '@/core';
import * as Organisms from '@/organisms';

/**
 * ProfilePosts
 *
 * Displays posts from the current user's profile with infinite scroll pagination.
 * Uses the author stream (author:{userId}) to fetch posts.
 */
export function ProfilePosts() {
  // Get current authenticated user
  const { currentUserPubky } = Core.useAuthStore();

  // Build stream ID for user's posts: author:{userId}
  const streamId = currentUserPubky
    ? (`${Core.StreamSource.AUTHOR}:${currentUserPubky}` as Core.AuthorStreamCompositeId)
    : undefined;

  // Delegate to TimelinePosts with the specific streamId
  return <Organisms.TimelinePosts streamId={streamId} />;
}
