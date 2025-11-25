'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef } from 'react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Types from './RepliesWithParent.types';

/**
 * TimelineRepliesWithParent
 *
 * Similar to TimelinePosts, but specifically for replies:
 * - Shows the parent post first (without reply line)
 * - Shows the reply post with isReply={true} (with reply line)
 */
export function TimelineRepliesWithParent({ streamId }: Types.TimelineRepliesWithParentProps) {
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
          {postIds.map((postId, index) => {
            // Get previous reply's parent to avoid duplicates
            const previousReplyId = index > 0 ? postIds[index - 1] : null;

            return (
              <ReplyWithParent
                key={`reply_${postId}`}
                replyPostId={postId}
                previousReplyId={previousReplyId}
                onPostClick={navigateToPost}
              />
            );
          })}

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

/**
 * ReplyWithParent
 *
 * Component that fetches and displays a reply post along with its parent.
 * If the parent is the same as the previous reply's parent, it won't show the parent again.
 */
function ReplyWithParent({ replyPostId, previousReplyId, onPostClick }: Types.ReplyWithParentProps) {
  const fetchedParentsRef = useRef<Set<string>>(new Set());

  // First useLiveQuery: Get parent post ID from relationships
  const parentPostId = useLiveQuery(async () => {
    const relationships = await Core.PostRelationshipsModel.findById(replyPostId);

    if (!relationships?.replied) {
      console.log('[ReplyWithParent] No replied relationship for:', replyPostId);
      return null;
    }

    const parentCompositeId = Core.buildCompositeIdFromPubkyUri({
      uri: relationships.replied, // parent post URI
      domain: Core.CompositeIdDomain.POSTS,
    });

    if (!parentCompositeId) {
      console.log('[ReplyWithParent] Could not build parentCompositeId');
      return null;
    }

    console.log('[ReplyWithParent] Parent ID resolved:', parentCompositeId);
    return parentCompositeId;
  }, [replyPostId]);

  // Fetch parent post if not in local DB (separate from observation)
  useEffect(() => {
    if (!parentPostId) return;
    if (fetchedParentsRef.current.has(parentPostId)) return; // Already fetched or fetching

    const fetchParentIfNeeded = async () => {
      const localPost = await Core.PostDetailsModel.findById(parentPostId);

      if (!localPost) {
        console.log('[ReplyWithParent] Parent post NOT found locally, fetching from Nexus:', parentPostId);
        fetchedParentsRef.current.add(parentPostId); // Mark as fetched to prevent loops

        const result = await Core.PostController.getOrFetchPost({ postId: parentPostId });
        console.log('[ReplyWithParent] Fetch result:', result ? 'SUCCESS' : 'NULL', parentPostId);

        // Double-check if it's now in the database
        const verifyPost = await Core.PostDetailsModel.findById(parentPostId);
        console.log('[ReplyWithParent] Verify after fetch:', verifyPost ? 'FOUND' : 'NOT FOUND', parentPostId);
      }
    };

    fetchParentIfNeeded();
  }, [parentPostId]);

  // Second useLiveQuery: Just observe the parent post in the database (reactive to upserts)
  const parentPost = useLiveQuery(async () => {
    if (!parentPostId) return null;

    const post = await Core.PostDetailsModel.findById(parentPostId);

    if (post) {
      console.log('[ReplyWithParent] Parent post found in DB:', parentPostId);
    } else {
      console.log('[ReplyWithParent] Parent post still not in DB:', parentPostId);
    }

    return post;
  }, [parentPostId]);

  // Get previous reply's parent to check if we should show parent again
  const previousParentPost = useLiveQuery(async () => {
    if (!previousReplyId) return null;

    const relationships = await Core.PostRelationshipsModel.findById(previousReplyId);
    if (!relationships?.replied) return null;

    const previousParentId = Core.buildCompositeIdFromPubkyUri({
      uri: relationships.replied,
      domain: Core.CompositeIdDomain.POSTS,
    });

    return previousParentId;
  }, [previousReplyId]);

  // Only show parent if it's different from the previous reply's parent
  const shouldShowParent = parentPostId && parentPostId !== previousParentPost;

  console.log(
    '[ReplyWithParent] Rendering - parentPost:',
    parentPost?.id,
    'previousParent:',
    previousParentPost,
    'shouldShow:',
    shouldShowParent,
  );

  return (
    <Atoms.Container overrideDefaults className="flex flex-col">
      {/* Show parent post only if it's different from previous reply's parent */}
      {shouldShowParent && (
        <>
          <Organisms.PostMain postId={parentPostId} onClick={() => onPostClick(parentPostId)} isReply={false} />
          <Atoms.Container overrideDefaults className="pl-3">
            <Atoms.PostThreadSpacer />
          </Atoms.Container>
        </>
      )}

      {/* Show the reply with isReply={true} */}
      <Atoms.Container overrideDefaults className={shouldShowParent ? 'pl-3' : ''}>
        <Organisms.PostMain
          postId={replyPostId}
          onClick={() => onPostClick(replyPostId)}
          isReply={true}
          isLastReply={true}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
