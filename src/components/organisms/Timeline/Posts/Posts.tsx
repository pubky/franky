'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Types from './Posts.types';

/**
 * TimelinePosts
 *
 * Self-contained component that manages the timeline feed with infinite scroll.
 *
 * Features:
 * - Cursor-based pagination using post ID and timestamp (skip for engagement streams)
 * - Automatic refetching when global filters change
 * - Handles both cache-first and remote fetching strategies
 * - Supports both timeline and engagement stream types
 * - Deduplicates posts to prevent duplicates during pagination
 */
export function TimelinePosts({ streamId: streamIdProp }: Types.TimelinePostsProps = {}) {
  // Get current streamId based on global filters (only if streamId prop not provided)
  const streamIdFromFilters = Hooks.useStreamIdFromFilters();
  const streamId = streamIdProp ?? streamIdFromFilters;

  const { postIds, loading, loadingMore, error, hasMore, loadMore } = Hooks.useStreamPagination({ streamId });
  const { navigateToPost } = Hooks.usePostNavigation();

  // Infinite scroll hook
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
    threshold: 3000,
    debounceMs: 20,
  });

  return (
    <Organisms.TimelineStateWrapper loading={loading} error={error} hasItems={postIds.length > 0}>
      <Atoms.Container>
        <Atoms.Container overrideDefaults className="space-y-4">
          {postIds.map((postId) => (
            <Atoms.Container key={`main_${postId}`}>
              <Organisms.PostMain postId={postId} onClick={() => navigateToPost(postId)} isReply={false} />
              <Organisms.TimelinePostReplies postId={postId} onPostClick={navigateToPost} />
            </Atoms.Container>
          ))}

          {/* Loading More Indicator */}
          {loadingMore && <Molecules.TimelineLoadingMore />}

          {/* Error on loading more */}
          {error && postIds.length > 0 && <Molecules.TimelineError message={error} />}

          {/* End of posts message */}
          {!hasMore && !loadingMore && postIds.length > 0 && <Molecules.TimelineEndMessage />}

          {/* Infinite scroll sentinel */}
          <Atoms.Container overrideDefaults className="h-[20px]" ref={sentinelRef} />
        </Atoms.Container>
      </Atoms.Container>
    </Organisms.TimelineStateWrapper>
  );
}
