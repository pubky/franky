import * as Core from '@/core';

/**
 * PostTagsListTag represents the tag data structure used in callbacks.
 * This matches Core.NexusTag which is the actual data returned from the database.
 */
export type PostTagsListTag = Core.NexusTag;

export interface PostTagsListProps {
  /** Array of tags to display */
  postId: string;
  /** Show the add tag input */
  showInput?: boolean;
  /** Show add button instead of input (mutually exclusive with showInput) */
  showAddButton?: boolean;
  /** Start in add button mode and open input on click */
  addMode?: boolean;
  /** Show emoji picker in input */
  showEmojiPicker?: boolean;
  /** Show close button on tags */
  showTagClose?: boolean;
  /** Maximum number of tags to display (default: 5) */
  maxTags?: number;
  /** Callback when a tag is clicked */
  onTagClick?: (tag: PostTagsListTag, index: number, event: React.MouseEvent) => void;
  /** Callback when a tag close button is clicked */
  onTagClose?: (tag: PostTagsListTag, index: number, event: React.MouseEvent) => void;
  /** Callback when a new tag is added */
  onTagAdd?: (label: string) => void;
  /** Callback when add button is clicked */
  onAddButtonClick?: () => void;
  /** Callback when emoji picker is clicked */
  onEmojiClick?: () => void;
  /** Additional className */
  className?: string;
}
