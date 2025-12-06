'use client';

import * as Core from '@/core';
import * as Molecules from '@/molecules';
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

  // Show loading state while waiting for profile data
  if (!streamId) {
    return <Molecules.TimelineLoading />;
  }

  return <ProfilePostsContent streamId={streamId} />;
}

/**
 * ProfilePostsContent
 *
 * Internal component that handles the actual posts fetching and display.
 * Only rendered when streamId is available.
 */
function ProfilePostsContent({ streamId }: { streamId: Core.AuthorStreamCompositeId }) {
  const { postIds, loading, loadingMore, error, hasMore, loadMore } = Hooks.useStreamPagination({
    streamId,
  });

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
