'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface PostMainProps {
  postId: string;
  onClick?: () => void;
  className?: string;
}

export function PostMain({ postId, onClick, className }: PostMainProps) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  // Fetch post tags
  const postTags = useLiveQuery(async () => {
    return await Core.PostTagsModel.findById(postId);
  }, [postId]);

  const tags =
    postTags?.tags.map((tag, index) => ({
      id: `${postId}-tag-${index}`,
      label: tag.label,
    })) || [];

  const handleReplyClick = () => {
    setReplyDialogOpen(true);
  };

  return (
    <>
      <Atoms.Card className={Libs.cn('cursor-pointer rounded-md py-0', className)} onClick={onClick}>
        <Atoms.CardContent className="flex flex-col gap-4 p-6">
          <Organisms.PostHeader postId={postId} />
          <Organisms.PostContent postId={postId} />
          <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-0">
            <Atoms.ClickStop>
              <Molecules.PostTagsList
                tags={tags}
                showInput={false}
                showAddButton={false}
                addMode
                showEmojiPicker={false}
                showTagClose={false}
              />
            </Atoms.ClickStop>

            <Atoms.ClickStop>
              <Organisms.PostActionsBar
                postId={postId}
                onReplyClick={handleReplyClick}
                className="w-full flex-1 justify-start md:justify-end"
              />
            </Atoms.ClickStop>
          </div>
        </Atoms.CardContent>
      </Atoms.Card>
      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChangeAction={setReplyDialogOpen} />
    </>
  );
}
