'use client';

import * as Core from '@/core';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';
import * as Hooks from '@/hooks';

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

  // Use stream pagination hook (only if streamId is available)
  const { postIds, loading, loadingMore, error, hasMore, loadMore } = Hooks.useStreamPagination({
    streamId: streamId ?? (Core.PostStreamTypes.TIMELINE_ALL_ALL as Core.PostStreamId),
  });

  // Delegate to TimelinePosts with the stream data
  return (
    <Organisms.TimelinePosts
      postIds={postIds}
      loading={loading}
      loadingMore={loadingMore}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}
