'use client';

import React, { useState } from 'react';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import type { SinglePostCardProps } from './SinglePostCard.types';

/**
 * SinglePostCard Organism
 *
 * Displays a single post in a full-width card format with two columns:
 * - Left column: PostHeader, PostContent, PostActionsBar
 * - Right column: PostTagsPanel (tags with avatars and search)
 *
 * This component is used on the single post page for the main post display.
 * It differs from PostMain by having the tags panel in a separate column
 * rather than inline with the action bar.
 */
export function SinglePostCard({ postId, className }: SinglePostCardProps) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);

  const handleReplyClick = () => {
    setReplyDialogOpen(true);
  };

  const handleRepostClick = () => {
    setRepostDialogOpen(true);
  };

  return (
    <>
      <Atoms.Card className={Libs.cn('min-w-0 rounded-lg py-0', className)}>
        <Atoms.CardContent className="flex min-w-0 flex-col gap-4 p-6">
          <Atoms.Container className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column - Post content */}
            <Atoms.Container className="flex flex-col gap-4 lg:col-span-2">
              <Organisms.PostHeader postId={postId} />

              <Organisms.PostContent postId={postId} />

              {/* Spacer to push actions bar to bottom */}
              <Atoms.Container overrideDefaults className="flex-1" />

              {/* Tags on mobile - between content and buttons */}
              <Organisms.PostTagsPanel postId={postId} className="block lg:hidden" />

              <Organisms.PostActionsBar
                postId={postId}
                onReplyClick={handleReplyClick}
                onRepostClick={handleRepostClick}
              />
            </Atoms.Container>

            {/* Right column - Tags (desktop only) */}
            <Organisms.PostTagsPanel postId={postId} className="hidden lg:block" />
          </Atoms.Container>
        </Atoms.CardContent>
      </Atoms.Card>

      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChangeAction={setReplyDialogOpen} />
      <Organisms.DialogRepost postId={postId} open={repostDialogOpen} onOpenChangeAction={setRepostDialogOpen} />
    </>
  );
}
