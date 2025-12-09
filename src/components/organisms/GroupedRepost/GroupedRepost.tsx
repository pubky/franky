'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { GroupedRepostProps } from './GroupedRepost.types';

/**
 * GroupedRepost
 *
 * Displays a grouped repost card showing multiple users who reposted the same original post.
 * Shows reposter summary with names and count, and renders the original post preview.
 * Includes undo functionality for current user's reposts.
 *
 * @example
 * ```tsx
 * <GroupedRepost entry={groupedRepostEntry} />
 * ```
 */
export function GroupedRepost({ entry }: GroupedRepostProps) {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  // Fetch original post details to check if it exists
  const { postDetails: originalPostDetails, isLoading: isLoadingOriginalPost } = Hooks.usePostDetails(
    entry.originalPostId ?? null,
  );

  // Fetch original post if missing
  const { fetchPost } = Hooks.useFetchPost();
  React.useEffect(() => {
    if (entry.originalPostId && !originalPostDetails && !isLoadingOriginalPost) {
      // Fire-and-forget fetch - useLiveQuery will react to DB updates
      fetchPost(entry.originalPostId);
    }
  }, [entry.originalPostId, originalPostDetails, isLoadingOriginalPost, fetchPost]);

  // Calculate reposter display values
  const {
    avatarReposterIds,
    avatarOverflowCount,
    firstReposterId,
    isCurrentUserReposted,
    othersCount,
    totalReposters,
    undoTargets,
  } = Hooks.calculateReposterDisplay({
    reposterIds: entry.reposterIds,
    postIds: entry.postIds,
    currentUserPubky: currentUserPubky ?? null,
  });

  const { userDetails: firstReposterUser } = Hooks.useUserDetails(firstReposterId);

  // Use first undo target as the hook's postId, fallback to first postId in group
  const firstUndoTarget = undoTargets[0] ?? entry.postIds[0] ?? '';
  const { deletePost, isDeleting } = Hooks.useDeletePost(firstUndoTarget);

  // Handle deleting all current user's reposts in the group
  const handleDeleteAll = async () => {
    if (!undoTargets.length || isDeleting) return;

    // Delete sequentially to reuse hook (and optimistic remove within hook)
    for (const id of undoTargets) {
      await deletePost(id);
    }
  };

  // Format reposter text for mobile and desktop
  const { mobileText, desktopText } = Hooks.renderReposterText({
    isCurrentUserReposted,
    firstReposterName: firstReposterUser?.name ?? firstReposterId,
    othersCount,
    totalReposters,
  });

  return (
    <Atoms.Card className="gap-0 rounded-md p-0" data-testid="grouped-repost">
      <Atoms.Container
        className="flex items-center justify-between rounded-t-md bg-muted px-4 py-3"
        overrideDefaults
        data-testid="grouped-repost-header"
      >
        <Atoms.Container className="flex items-center gap-3" overrideDefaults>
          <Libs.Repeat className="size-5" aria-label="Repeat" />
          <Atoms.Typography as="span" className="text-base font-bold text-foreground md:hidden" overrideDefaults>
            {mobileText}
          </Atoms.Typography>
          <Atoms.Typography as="span" className="hidden text-base font-bold text-foreground md:inline" overrideDefaults>
            {desktopText}
          </Atoms.Typography>
          {/* Avatar group - only show on desktop/web */}
          {avatarReposterIds.length > 0 && (
            <Atoms.Container className="hidden items-center pl-0 md:flex" overrideDefaults>
              {avatarReposterIds.map((reposterId, index) => (
                <Molecules.ReposterAvatar key={reposterId} reposterId={reposterId} index={index} />
              ))}
              {avatarOverflowCount > 0 && (
                <Atoms.Container
                  className={Libs.cn(
                    'flex shrink-0 items-center justify-center rounded-full bg-background shadow-sm',
                    'size-8 text-sm font-medium text-foreground',
                    avatarReposterIds.length > 0 && '-ml-2',
                  )}
                  overrideDefaults
                >
                  +{avatarOverflowCount}
                </Atoms.Container>
              )}
            </Atoms.Container>
          )}
        </Atoms.Container>
        <Atoms.Container className="flex items-center gap-1" overrideDefaults>
          {/* Undo repost button - show when current user reposted */}
          {isCurrentUserReposted && (
            <Atoms.Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="h-auto px-0 text-destructive hover:bg-transparent hover:text-destructive"
              aria-label={isDeleting ? 'Undoing repost...' : 'Undo repost'}
              data-testid="grouped-repost-undo-button"
            >
              {isDeleting ? 'Undoing...' : 'Undo repost'}
            </Atoms.Button>
          )}
        </Atoms.Container>
      </Atoms.Container>

      {entry.originalPostId ? (
        <Molecules.PostPreviewCard postId={entry.originalPostId} data-testid="grouped-repost-preview" />
      ) : (
        <Atoms.Container
          className="p-4 text-sm text-muted-foreground"
          overrideDefaults
          data-testid="grouped-repost-error"
        >
          Unable to load original post
        </Atoms.Container>
      )}
    </Atoms.Card>
  );
}
