'use client';

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
  // Fetch post tags
  const postTags = useLiveQuery(async () => {
    return await Core.PostTagsModel.findById(postId);
  }, [postId]);

  const tags =
    postTags?.tags.map((tag, index) => ({
      id: `${postId}-tag-${index}`,
      label: tag.label,
    })) || [];

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Atoms.Card className={Libs.cn('rounded-md py-0', className)}>
        <Atoms.CardContent className="p-6 flex flex-col gap-4">
          <Organisms.PostHeader postId={postId} />
          <Organisms.PostContent postId={postId} />
          <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-2">
            <Molecules.PostTagsList
              tags={tags}
              showInput={false}
              showAddButton={false}
              addMode
              showEmojiPicker={false}
              showTagClose={false}
            />

            <Organisms.PostActionsBar postId={postId} />
          </div>
        </Atoms.CardContent>
      </Atoms.Card>
    </div>
  );
}
