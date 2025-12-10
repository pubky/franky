import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Types from './PostTagsList.types';

/**
 * PostTagsList
 *
 * Wrapper around ClickableTagsList specifically for POST tags.
 * Uses default constants from ClickableTagsList.
 */
export function PostTagsList({
  postId,
  showInput = true,
  showAddButton = false,
  addMode = false,
  showEmojiPicker = false,
  showTagClose = false,
  maxTags,
  onTagClick,
  onTagClose,
  onTagAdd,
  onAddButtonClick,
  onEmojiClick,
  className,
}: Types.PostTagsListProps) {
  return (
    <Organisms.ClickableTagsList
      taggedId={postId}
      taggedKind={Core.TagKind.POST}
      maxTags={maxTags}
      showCount={true}
      showInput={showInput}
      showAddButton={showAddButton}
      addMode={addMode}
      showEmojiPicker={showEmojiPicker}
      showTagClose={showTagClose}
      onTagClick={onTagClick}
      onTagClose={onTagClose}
      onTagAdd={onTagAdd}
      onAddButtonClick={onAddButtonClick}
      onEmojiClick={onEmojiClick}
      className={className}
    />
  );
}
