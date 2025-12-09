'use client';

import React, { useState } from 'react';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface PostMainProps {
  postId: string;
  onClick?: () => void;
  className?: string;
  isReply?: boolean;
  isLastReply?: boolean;
}

export function PostMain({ postId, onClick, className, isReply = false, isLastReply = false }: PostMainProps) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);

  // Get post height for thread connector
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  // Determine thread connector variant based on reply status
  const connectorVariant = isLastReply ? 'last' : 'regular';

  // Get repost information
  const { isRepost, repostAuthorId, isCurrentUserRepost, originalPostId } = Hooks.useRepostInfo(postId);
  const { userDetails: repostAuthorDetails } = Hooks.useUserDetails(repostAuthorId ?? null);

  // Determine which post ID to use for getting reposters
  // If viewing a repost, show who reposted the original. Otherwise, show who reposted this post.
  const targetPostIdForReposters = originalPostId ?? postId;

  // Get all reposters
  const {
    reposterIds,
    totalCount: repostersCount,
    isLoading: isLoadingReposters,
  } = Hooks.useReposters(targetPostIdForReposters);

  // Get post details for timestamp
  const { postDetails } = Hooks.usePostDetails(targetPostIdForReposters);
  const timeAgo = postDetails ? Libs.formatNotificationTime(postDetails.indexed_at) : null;

  // Format repost text and get visible reposters
  const MAX_VISIBLE_REPOSTERS = 5;
  const visibleReposterIds = reposterIds.slice(0, MAX_VISIBLE_REPOSTERS);
  const remainingCount = Math.max(0, repostersCount - MAX_VISIBLE_REPOSTERS);

  // Format repost text using hook
  const { repostText } = Hooks.useRepostText({
    isCurrentUserRepost,
    reposterIds,
    repostersCount,
    isLoadingReposters,
    repostAuthorDetails,
  });

  // Hook for deleting repost (undo functionality)
  const { deletePost, isDeleting } = Hooks.useDeletePost(postId);

  const handleUndoRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePost();
  };

  const handleReplyClick = () => {
    setReplyDialogOpen(true);
  };

  const handleRepostClick = () => {
    setRepostDialogOpen(true);
  };

  const handleFooterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <Atoms.Container overrideDefaults onClick={onClick} className="relative flex cursor-pointer">
        {isReply && (
          <Atoms.Container overrideDefaults className="w-3 shrink-0">
            <Atoms.PostThreadConnector height={postHeight} variant={connectorVariant} />
          </Atoms.Container>
        )}
        <Atoms.Card ref={cardRef} className={Libs.cn('flex-1 rounded-md py-0', className)}>
          {/* Repost indicator bar - full width at the top of the card */}
          {isRepost && (
            <Atoms.Container
              className={Libs.cn(
                'flex h-14 items-center justify-between rounded-t-md bg-muted px-6 py-3 text-xs text-muted-foreground',
              )}
              overrideDefaults
            >
              <Atoms.Container className="flex items-center gap-3" overrideDefaults>
                <Libs.Repeat className="size-4" />
                <Atoms.Typography as="span" className="text-xs font-medium" overrideDefaults>
                  {repostText}
                </Atoms.Typography>
                {/* Avatar group */}
                {!isLoadingReposters && repostersCount > 0 && (
                  <Atoms.Container className="flex items-center pr-2 pl-0" overrideDefaults>
                    {visibleReposterIds.map((reposterId, index) => (
                      <Molecules.ReposterAvatar key={reposterId} reposterId={reposterId} index={index} />
                    ))}
                    {remainingCount > 0 && (
                      <Atoms.Container
                        className={Libs.cn(
                          'flex shrink-0 items-center justify-center rounded-full bg-background shadow-sm',
                          'size-8 text-xs font-medium text-foreground',
                          visibleReposterIds.length > 0 && '-ml-2',
                        )}
                        overrideDefaults
                      >
                        +{remainingCount}
                      </Atoms.Container>
                    )}
                  </Atoms.Container>
                )}
                {/* Undo button - only show when current user reposted */}
                {isCurrentUserRepost && (
                  <Atoms.Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndoRepost}
                    disabled={isDeleting}
                    className="h-auto p-0 text-xs font-medium text-destructive hover:bg-transparent hover:text-destructive"
                  >
                    {isDeleting ? 'Undoing...' : 'Undo'}
                  </Atoms.Button>
                )}
              </Atoms.Container>
              {/* Timestamp */}
              {timeAgo && (
                <Atoms.Container className="flex items-center gap-1" overrideDefaults>
                  <Libs.Clock className="size-4 text-muted-foreground" />
                  <Atoms.Typography
                    as="span"
                    className="text-xs leading-4 font-medium tracking-[0.075rem] text-muted-foreground"
                    overrideDefaults
                  >
                    {timeAgo}
                  </Atoms.Typography>
                </Atoms.Container>
              )}
            </Atoms.Container>
          )}
          <Molecules.PostPreviewCard postId={postId}>
            <Atoms.Container onClick={handleFooterClick} className="justify-between gap-2 md:flex-row md:gap-0">
              <Molecules.PostTagsList postId={postId} showInput={false} addMode={true} />
              <Organisms.PostActionsBar
                postId={postId}
                onReplyClick={handleReplyClick}
                onRepostClick={handleRepostClick}
                className="w-full flex-1 justify-start md:justify-end"
              />
            </Atoms.Container>
          </Molecules.PostPreviewCard>
        </Atoms.Card>
      </Atoms.Container>
      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChangeAction={setReplyDialogOpen} />
      <Organisms.DialogRepost postId={postId} open={repostDialogOpen} onOpenChangeAction={setRepostDialogOpen} />
    </>
  );
}
