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

  const handleReplyClick = () => {
    setReplyDialogOpen(true);
  };

  const handleInteractiveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <Atoms.Card className={Libs.cn('rounded-lg py-0', className)}>
        <Atoms.CardContent className="flex flex-col gap-4 p-6">
          <Atoms.Container className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column - Post content */}
            <Atoms.Container className="flex flex-col gap-4 lg:col-span-2">
              <Atoms.Container overrideDefaults onClick={handleInteractiveClick}>
                <Organisms.PostHeader postId={postId} />
              </Atoms.Container>

              <Organisms.PostContent postId={postId} />

              {/* Spacer to push actions bar to bottom */}
              <Atoms.Container overrideDefaults className="flex-1" />

              {/* Tags on mobile - between content and buttons */}
              <Atoms.Container className="block lg:hidden" onClick={handleInteractiveClick}>
                <Organisms.PostTagsPanel postId={postId} />
              </Atoms.Container>

              <Atoms.Container overrideDefaults onClick={handleInteractiveClick}>
                <Organisms.PostActionsBar postId={postId} onReplyClick={handleReplyClick} />
              </Atoms.Container>
            </Atoms.Container>

            {/* Right column - Tags (desktop only) */}
            <Atoms.Container className="hidden lg:block" onClick={handleInteractiveClick}>
              <Organisms.PostTagsPanel postId={postId} />
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.CardContent>
      </Atoms.Card>

      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChangeAction={setReplyDialogOpen} />
    </>
  );
}
