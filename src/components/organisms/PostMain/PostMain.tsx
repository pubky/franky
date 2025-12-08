'use client';

import React, { useState } from 'react';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/atoms';

export interface PostMainProps {
  postId: string;
  onClick?: () => void;
  className?: string;
  isReply?: boolean;
  isLastReply?: boolean;
}

export function PostMain({ postId, onClick, className, isReply = false, isLastReply = false }: PostMainProps) {
  const { postDetails } = Hooks.usePostDetails(postId);
  const isDeleted = Libs.isPostDeleted(postDetails?.content);

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  // Get post height for thread connector
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  // Determine thread connector variant based on reply status
  const connectorVariant = isLastReply ? POST_THREAD_CONNECTOR_VARIANTS.LAST : POST_THREAD_CONNECTOR_VARIANTS.REGULAR;

  const handleReplyClick = () => {
    setReplyDialogOpen(true);
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
          {isDeleted ? (
            <Molecules.PostDeleted />
          ) : (
            <Atoms.CardContent className="flex flex-col gap-4 p-6">
              <Organisms.PostHeader postId={postId} />
              <Organisms.PostContent postId={postId} />
              <Atoms.Container onClick={handleFooterClick} className="justify-between gap-2 md:flex-row md:gap-0">
                <Molecules.PostTagsList postId={postId} showInput={false} addMode={true} />
                <Organisms.PostActionsBar
                  postId={postId}
                  onReplyClick={handleReplyClick}
                  className="w-full flex-1 justify-start md:justify-end"
                />
              </Atoms.Container>
            </Atoms.CardContent>
          )}
        </Atoms.Card>
      </Atoms.Container>
      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChangeAction={setReplyDialogOpen} />
    </>
  );
}
