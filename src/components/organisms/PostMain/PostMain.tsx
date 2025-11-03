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
      <div onClick={onClick} className="cursor-pointer">
        <Atoms.Card className={Libs.cn('w-full', className)}>
          <Atoms.CardContent className="px-4 md:px-6 md:py-0">
            <div className="flex flex-col gap-4 md:gap-4 w-full">
              <Organisms.PostHeader postId={postId} />

              <Organisms.PostContent postId={postId} />

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-wrap md:flex-nowrap justify-start md:justify-start">
                <Molecules.PostTagsList
                  tags={tags}
                  showInput={false}
                  showAddButton={false}
                  addMode
                  showEmojiPicker={false}
                  showTagClose={false}
                />

                <Organisms.PostActionsBar
                  postId={postId}
                  onReplyClick={handleReplyClick}
                  className="justify-start w-full flex-1 md:justify-end"
                />
              </div>
            </div>
          </Atoms.CardContent>
        </Atoms.Card>
      </div>
      <Organisms.DialogReply postId={postId} open={replyDialogOpen} onOpenChange={setReplyDialogOpen} />
    </>
  );
}
