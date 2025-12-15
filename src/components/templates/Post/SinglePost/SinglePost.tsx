'use client';

import { useParams } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * SinglePost Template
 *
 * Displays a single post page with:
 * - Main post card (FULL WIDTH) with tags panel in two-column layout
 * - Below: Two columns with Replies timeline (larger) and Participants sidebar (smaller)
 *
 * This template uses a FIXED layout that doesn't change based on user preferences.
 */
export function SinglePost() {
  const { postId, userId } = useParams() as { postId: string; userId: string };
  const compositeId = Core.buildCompositeId({ pubky: userId, id: postId });

  // Use the dedicated hook for fetching replies
  const { replyIds, loading, loadingMore, error, hasMore, loadMore } = Hooks.usePostReplies(compositeId);

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
    <>
      {/* Mobile header */}
      <Molecules.MobileHeader showLeftButton={false} showRightButton={false} />

      {/* Main content container */}
      <Atoms.Container
        overrideDefaults
        className={Libs.cn(
          'max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
          'm-auto w-full px-6 pb-12 xl:px-0',
          'pt-0',
        )}
      >
        {/* Main post card - FULL WIDTH */}
        <Organisms.SinglePostCard postId={compositeId} />

        {/* Two columns: Replies thread + Participants */}
        <Atoms.Container overrideDefaults className="flex gap-6">
          {/* Left column - Replies thread connected to main post (larger) */}
          <Atoms.Container className="w-full min-w-0 flex-1 gap-0 overflow-hidden">
            {/* Initial loading state */}
            {loading && (
              <Atoms.Container className="flex items-center justify-center gap-3 py-8">
                <Atoms.Spinner size="md" />
                <Atoms.Typography as="p" className="text-muted-foreground">
                  Loading replies...
                </Atoms.Typography>
              </Atoms.Container>
            )}

            {/* Error state */}
            {error && !loading && <Molecules.TimelineError message={error} />}

            {/* Replies list with thread connectors */}
            {!loading && replyIds.length > 0 && (
              <Atoms.Container overrideDefaults className="ml-3">
                {replyIds.map((replyId, index) => (
                  <Atoms.Container key={`reply_${replyId}`} overrideDefaults>
                    <Atoms.PostThreadSpacer />
                    <Organisms.PostMain
                      postId={replyId}
                      isReply={true}
                      onClick={() => navigateToPost(replyId)}
                      isLastReply={index === replyIds.length - 1 && !hasMore}
                    />
                  </Atoms.Container>
                ))}

                {/* Loading more indicator */}
                {loadingMore && <Molecules.TimelineLoadingMore />}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-1" />

                {/* End of replies message */}
                {!hasMore && replyIds.length > 0 && <Molecules.TimelineEndMessage />}
              </Atoms.Container>
            )}
          </Atoms.Container>

          {/* Right column - Participants sidebar (desktop only) */}
          <Atoms.Container
            overrideDefaults
            className={Libs.cn(
              'sticky hidden flex-col items-start justify-start gap-6 self-start pt-6 lg:flex',
              'top-[147px]',
              'w-full max-w-xs',
            )}
          >
            <Organisms.SinglePostParticipants postId={compositeId} />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>

      {/* Mobile footer navigation */}
      <Molecules.MobileFooter />
    </>
  );
}
