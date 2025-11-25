export interface PostTagsListTag {
  /** Tag label */
  label: string;
  /** Number of posts with this tag (optional) */
  count?: number;
  /** Custom color for the tag */
  color?: string;
  /** Whether the tag is selected */
  selected?: boolean;
}

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
  /** Callback when a tag is clicked */
  onTagClick?: (tag: PostTagsListTag, index: number) => void;
  /** Callback when a tag close button is clicked */
  onTagClose?: (tag: PostTagsListTag, index: number) => void;
  /** Callback when a new tag is added */
  onTagAdd?: (label: string) => void;
  /** Callback when add button is clicked */
  onAddButtonClick?: () => void;
  /** Callback when emoji picker is clicked */
  onEmojiClick?: () => void;
  /** Additional className */
  className?: string;
}
