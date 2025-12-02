'use client';

import * as Core from '@/core';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';

/**
 * ProfilePosts
 *
 * Displays posts from a user's profile with infinite scroll pagination.
 * Uses the author stream (author:{userId}) to fetch posts.
 * Uses ProfileContext to get the target user's pubky.
 */
export function ProfilePosts() {
  // Get the profile pubky from context
  const { pubky } = Providers.useProfileContext();

  // Build stream ID for user's posts: author:{userId}
  const streamId = pubky ? (`${Core.StreamSource.AUTHOR}:${pubky}` as Core.AuthorStreamCompositeId) : undefined;

  // Delegate to TimelinePosts with the specific streamId
  return <Organisms.TimelinePosts streamId={streamId} />;
}
