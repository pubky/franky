import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

import type { PostTagsListTag } from '@/molecules/PostTagsList/PostTagsList';

export interface PostMainProps {
  className?: string;
  // Header
  avatarSrc?: string;
  avatarAlt?: string;
  displayName: string;
  label?: string;
  timeLabel?: string;
  // Content
  text: string;
  // Tags
  tags?: PostTagsListTag[];
  showAddButton?: boolean;
  showEmojiPicker?: boolean;
  showTagClose?: boolean;
  onTagClick?: (tag: PostTagsListTag, index: number) => void;
  onTagClose?: (tag: PostTagsListTag, index: number) => void;
  onTagAdd?: (label: string) => void;
  onEmojiClick?: () => void;
  // Actions
  tagCount?: number;
  replyCount?: number;
  repostCount?: number;
  isBookmarked?: boolean;
  onTagActionClick?: () => void;
  onReplyClick?: () => void;
  onRepostClick?: () => void;
  onBookmarkClick?: () => void;
  onMoreClick?: () => void;
}

export function PostMain({
  className,
  avatarSrc,
  avatarAlt,
  displayName,
  label,
  timeLabel,
  text,
  tags = [],
  showAddButton = true,
  showEmojiPicker = true,
  showTagClose = false,
  onTagClick,
  onTagClose,
  onTagAdd,
  onEmojiClick,
  tagCount = 5,
  replyCount = 7,
  repostCount = 3,
  isBookmarked = false,
  onTagActionClick,
  onReplyClick,
  onRepostClick,
  onBookmarkClick,
  onMoreClick,
}: PostMainProps) {
  return (
    <Atoms.Card className={Libs.cn('w-full', className)}>
      <Atoms.CardContent className="px-4 md:px-6 md:py-0">
        <div className="flex flex-col gap-4 md:gap-4 w-full">
          <Molecules.PostHeader
            avatarSrc={avatarSrc}
            avatarAlt={avatarAlt}
            displayName={displayName}
            label={label}
            timeLabel={timeLabel}
          />

          <Molecules.PostContent text={text} />

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4  flex-wrap md:flex-nowrap justify-start md:justify-start">
            <Molecules.PostTagsList
              tags={tags}
              showInput={false}
              showAddButton={showAddButton}
              addMode
              showEmojiPicker={showEmojiPicker}
              showTagClose={showTagClose}
              onTagClick={onTagClick}
              onTagClose={onTagClose}
              onTagAdd={onTagAdd}
              onEmojiClick={onEmojiClick}
            />

            <Molecules.PostActionsBar
              tagCount={tagCount}
              replyCount={replyCount}
              repostCount={repostCount}
              isBookmarked={isBookmarked}
              onTagClick={onTagActionClick}
              onReplyClick={onReplyClick}
              onRepostClick={onRepostClick}
              onBookmarkClick={onBookmarkClick}
              onMoreClick={onMoreClick}
              className="justify-start w-full flex-1 md:justify-end"
            />
          </div>
        </div>
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
